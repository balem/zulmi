const openssl = require('openssl-nodejs');
var SignedXml = require('xml-crypto').SignedXml;
var FileKeyInfo = require('xml-crypto').FileKeyInfo;
var fs = require('fs');
var express = require("express");
var router = express.Router();
const db = require("../../modules/db/db");
const utils = require("../../modules/utils");
require("dotenv-safe").load();
const { exec } = require('child_process');
const moment = require('moment');

router.get('/', async (req, res, next) => {
    let query = db.pg
    .table("xml_suspensiones")
    .join('employee', 'employee.id', 'xml_suspensiones.employee_id')
    .select('xml_suspensiones.*', 'employee.nombres', 'employee.apellidos');

    if (req.query.fecha_inicio) {
        query = query.where('fecha_inicio', `${req.query.fecha_inicio}`)
    }

    if (req.query.fecha_fin) {
        query = query.where('fecha_fin', `${req.query.fecha_fin}`)
    }
    
    if (req.query.user_email) {
        query = query.where('employee.email', `${req.query.user_email}`)
    }

    query
    .then((suspensiones) => {
        if (suspensiones.length === 0) {
            return res.status(200).json({
                status: "error",
                data: "Suspensiones no encontradas"
            });
        } else {
            return res.status(200).json({
                status: "success",
                data: suspensiones
            });
        }
    })
})

router.get('/:id', async (req, res, next) => {
    await db.pg
    .table("xml_suspensiones")
    .where('xml_suspensiones.id', req.params.id)
    .join('employee', 'employee.id', 'xml_suspensiones.employee_id')
    .select('xml_suspensiones.*', 'employee.nombres', 'employee.apellidos')
    .then((suspensiones) => {
        if (suspensiones.length === 0) {
            return res.status(200).json({
                status: "error",
                data: "Amonestación no encontrada"
            });
        } else {
            return res.status(200).json({
                status: "success",
                data: suspensiones[0]
            });
        }
    })
})

router.post("/new", async (req, res, next) => {
    var company = await GetCompany();
    let data ='Suspención nueva ' + req.body.employee_id + ', ' + req.body.motivo;
    utils.insertLogs(req.body.creator, data);
    if (company !== false) {
        await db.pg.insert({
            employee_id: req.body.employee_id,
            company_id: company.id,
            motivo: req.body.motivo,
            fecha_inicio: req.body.fecha_inicio,
            fecha_fin: req.body.fecha_fin,
            suspension_judicial: req.body.suspension_judicial ? true : false,
        })
            .table("xml_suspensiones")  
            .returning("*")
            .then(async xmls => {
                res.send({
                    status: 'success',
                    data: xmls[0]
                })
            })
            .catch(e => {
                console.log('ERRO AO INSERIR XML: ' + e);
                res.send({ status: false, message: 'Falha na inclusão de xmls: ' + e });
                //return false;
            });
    } else {
        res.send({ error: "Empresa no encontrada" })
    }
})

router.post("/sign", async function (req, res, next) {
    try {
        //busca a empresa
        let data ='Suspención firma ' + req.body.user_email;
        utils.insertLogs(req.body.user_email, data);
        return db.pg.select("*")
            .table("company")
            .then(async companies => {
                //BUSCA O EMPREGADO

                var employee = await GetEmployeeByEmail(req.body.user_email);
                console.log("EMAIL: " + req.body.user_email);

                //AJUSTA O PATH DE ACORDO COM O CI
                var path = "empresa-" + companies[0].ruc + "/ci-" + employee.identification;

                //BUSCA O USUÁRIO DO EMPREGADO PARA DESCOBRIR O TIPO
                var signatureType = await GetSignatureType(employee.identification);

                if (signatureType === false) {
                    return res.status(200).json({
                        status: "error",
                        data: "Perfil de usuario inválido"
                    });
                }

                //COMANDOS
                var comandoPrivate = `openssl pkcs12 -in certificates/${path}/certificate.pfx -out certificates/${path}/private.pem -passin pass:${req.body.pin} -nodes`;
                var comandoPublic = `openssl pkcs12 -in openssl/certificates/${path}/certificate.pfx -clcerts -nokeys -passin pass:${req.body.pin} | awk '/BEGIN/ { i++; } /BEGIN/, /END/ { print > "openssl/certificates/${path}/public.pem" }'`;

                //BUSCA XML NO BD OU MONTA XML CASO NÃO EXISTA AINDA
                return db.pg.select("*")
                    .table('xml_suspensiones')
                    .where("id", req.body.id)
                    .then(async xmls => {
                        var xml = xmls[0].xml;

                        if (xml === null) {
                            //CRIA O XML
                            xml = await GetXML(xmls[0]);
                        }

                        //CONVERTE CHAVE PRIVADA
                        return openssl(comandoPrivate, (err, buffer) => {
                            if (err.toString() === "") {
                                //CONVERTE CHAVE PÚBLICA
                                //openssl(comandoPublic, (err, buffer) => {
                                return exec(comandoPublic, async (err, stdout, stderr) => {
                                    if (!err) {

                                        //ASSINA
                                        var sig = new SignedXml();
                                        var publicKey = fs.readFileSync(`./openssl/certificates/${path}/public.pem`);
                                        publicKey = String(publicKey).replace('-----BEGIN CERTIFICATE-----', '');
                                        publicKey = String(publicKey).replace('-----END CERTIFICATE-----', '');
                                        sig.keyInfoProvider = {
                                            getKeyInfo: (key, prefix) => {
                                                return `<X509Data><X509Certificate>${publicKey}</X509Certificate></X509Data>`;
                                            }
                                        };
                                        var transforms = ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"];
                                        sig.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
                                        sig.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
                                        sig.addReference(`//*[local-name(.)='Signature${signatureType}']`, transforms, "http://www.w3.org/2001/04/xmlenc#sha256", "http://firma.mtess.gov.py");
                                        sig.signingKey = fs.readFileSync(`./openssl/certificates/${path}/private.pem`);
                                        sig.computeSignature(xml, {
                                            location: {
                                                reference: `//*[local-name(.)='Signature${signatureType}']`,
                                                action: 'append'
                                            }
                                        });

                                        xml = sig.getSignedXml();

                                        //SALVA XML NO BD
                                        return await db.pg.update({
                                            xml: xml
                                        })
                                            .table('xml_suspensiones')
                                            .where("id", req.body.id)
                                            .returning("*")
                                            .then(async xmls => {
                                                //ATUALIZA O STATUS DA ASSINATURA DO XML DE ACORDO COM O PERFIL DE USUÁRIO
                                                var updateXmlSignature = await UpdateXmlSignature(xmls[0].id, signatureType, employee);
                                                if (!updateXmlSignature) {
                                                    return res.status(200).json({
                                                        status: "error",
                                                        data: "Erro ao atualizar assinatura no XML"
                                                    });
                                                }

                                                //ATUALIZA O STATUS DO XML
                                                var updateXmlStatus = await UpdateXmlStatus(xmls[0].id);
                                                if (!updateXmlStatus) {
                                                    return res.status(200).json({
                                                        status: "error",
                                                        data: "Erro ao atualizar status do XML"
                                                    });
                                                }

                                                //ATUALIZA O STATUS DO DOCUMENTO:
                                                // UpdateDocumentStatus(document.id);

                                                //RETORNA STATUS 200
                                                return res.status(200).json({
                                                    status: "success",
                                                    data: "Documento firmado exitosamente"
                                                });
                                            })
                                            .catch(e => {
                                                return res.status(200).json({
                                                    status: "error",
                                                    data: "Error al actualizar XML"
                                                });
                                            });;
                                    } else {
                                        return res.status(200).json({
                                            status: "error",
                                            data: "Erro ao converter chave pública: " + err
                                        });
                                    }
                                });
                            } else {
                                return res.status(200).json({
                                    status: "error",
                                    data: "Erro ao converter chave privada: " + err
                                });
                            }
                        });
                    })
                    .catch(e => {
                        if (signatureType === false) {
                            return res.status(200).json({
                                status: "error",
                                data: "Erro ao buscar XML"
                            });
                        }
                    });
            });
    } catch (error) {
        console.log(error);
    }
});

async function GetSignatureType(identification) {
    return await db.pg.select("*")
        .from("employee")
        .innerJoin("usuario", "usuario.id", "employee.user_id")
        .innerJoin("user_profile", "user_profile.id", "usuario.profile_id")
        .where("employee.identification", identification)
        //.options({nestTables: true})
        .then(employees => {
            //if (employees.count > 0) {
            switch (employees[0].profile_slug) {
                case "director":
                    return "DIRECTOR";
                case "rh":
                    return "RRHH";
                case "funcionario":
                    return "EMPLEADO";
                case "master":
                    return false;
                default:
                    return false;
            }
        })
        .catch(e => {
            return false;
        });
}

async function GetXML(xmlObj) {
    //GET COMPANY
    var company = await GetCompany(xmlObj.company_id);
    //GET EMPLOYEE
    var employee = await GetEmployee(xmlObj.employee_id);
    //GET XML --> VEM NOS PARÂMETROS
    
    // console.log("xmlObj: " + JSON.stringify(xmlObj));
    // console.log("company: " + JSON.stringify(company));
    // console.log("employee: " + JSON.stringify(employee));
    // console.log("xmlDetails: " + JSON.stringify(xmlDetails));

    //TIPODOCUMENTO + DIAPAGO + MESPAGO + ANOPAGO + DIACREACION + MESCREACION + ANOCREACION + HORACREACION + 
    //MINUTOCREACION + NROMTESSPATRONAL + NROIPSEMPLEADO
    var hash_kude = "01" + moment(xmlObj.fecha_de_pago).format("DDMMYYYY") + moment().format("DDMMYYYYHHmm")  + employee.mtess_patronal + employee.identification;

    console.log(hash_kude);

    await SaveHashKude(xmlObj.id, hash_kude);

    try {

        var xml =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<dRS xmlns="http://firma.mtess.gov.py/xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://firma.mtess.gov.py/xsd siRecepDE_v150.xsd">' +
                '<dVerFor>005</dVerFor>' +
                "<hashKude>" + hash_kude + "</hashKude>" +
                "<RS>" +
                    "<encabezado>" +
                        "<llave>" + company.hash + "</llave>" +
                        "<razonSocial>" + company.razon_social + "</razonSocial>" +
                        "<ruc>" + company.ruc + "</ruc>" +
                        "<dv>" + company.dv + "</dv>" +
                        "<nroMTESSPatronal>" + company.ips_patronal + "</nroMTESSPatronal>" +
                    // "<legajo>1</legajo>" +
                        "<apellidos>" + employee.apellidos + "</apellidos>" +
                        "<nombres>" + employee.nombres + "</nombres>" +
                        "<sueldoJornal>" + employee.sueldo_jornal + "</sueldoJornal>" +
                        "<nroIPSEmpleado>" + employee.ips_empleado + "</nroIPSEmpleado>" +
                        "<cINro>" + employee.identification + "</cINro>" +
                        "<fechaIngreso>01/01/2018</fechaIngreso>" +
                        "<mesDePago>" + moment(xmlObj.mes_de_pago).format('YYYY-MM-DD') + "</mesDePago>" +
                        "<fechaDeCreacion>" + moment(new Date()).format('YYYY-MM-DD HH:mm') + "</fechaDeCreacion>" +
                    "</encabezado>" +
                    "<cuerpo>" +
                        "<suspensionJudicial>" + ( xmlObj.suspension_judicial ? 'true' : 'false' ) + "</suspensionJudicial>" +
                        "<motivo>" + xmlObj.motivo + "</motivo>" +
                        "<fechaInicio>" + moment(xmlObj.fecha_inicio).format('YYYY-MM-DD') + "</fechaInicio>" +
                        "<fechaFin>" + moment(xmlObj.fecha_fin).format('YYYY-MM-DD') + "</fechaFin>" +
                    "</cuerpo>" +
                "</RS>" +
                "<SignatureRRHH>" +
                "</SignatureRRHH>" +
                "<SignatureEMPLEADO>" +
                "</SignatureEMPLEADO>" +
            "</dRS>";

        return xml;
    } catch (error) {
        console.log(error);
        return "";
    }
}

async function GetCompany(id) {
    return await db.pg.select('*')
        .table('company')
        // .where('id', id)
        .then(companies => {
            if (companies.length > 0) {
                return companies[0];
            } else {
                return false;
            }
        })
        .catch(e => {
            return false;
        });
}

async function GetDocument(id) {
    return await db.pg.select('document.id')
        .table('document')
        .join('xml', 'xml.document_id', 'document.id')
        .where('xml.id', id)
        .then(documents => {
            if (documents.length > 0) {
                return documents[0];
            } else {
                return false;
            }
        })
        .catch(e => {
            return false;
        });
}

async function GetEmployee(id) {
    return await db.pg.select('*')
        .table('employee')
        .where('id', id)
        .then(employees => {
            if (employees.length > 0) {
                return employees[0];
            } else {
                return false;
            }
        })
        .catch(e => {
            return false;
        });
}

async function GetEmployeeByEmail(email) {
    return await db.pg.select('*')
        .table('employee')
        .where('email', email)
        .then(employees => {
            if (employees.length > 0) {
                return employees[0];
            } else {
                return false;
            }
        })
        .catch(e => {
            return false;
        });
}

async function UpdateXmlSignature(id, signatureType, employee) {
    switch (signatureType) {
        case "DIRECTOR":
            return await UpdateDirectorXmlSignature(id, employee);
        case "RRHH":
            return await UpdateRRHHXmlSignature(id, employee);
        case "EMPLEADO":
            return await UpdateEmpleadoXmlSignature(id, employee);
        default:
            return false;
    }
}

async function UpdateDirectorXmlSignature(id, employee) {
    return await db.pg.update({
        signature_director: true,
        signature_director_datetime: moment(),
        signature_director_name: employee.nombres + " " + employee.apellidos
    })
        .table('xml_suspensiones')
        .where("id", id)
        .then(() => {
            return true;
        })
        .catch(e => {
            return false;
        });
}

async function UpdateRRHHXmlSignature(id, employee) {
    console.log("EMPLOYEE RRHH: " + employee);
    return await db.pg.update({
        signature_rrhh: true,
        signature_rrhh_datetime: moment(),
        signature_rrhh_name: employee.nombres + " " + employee.apellidos
    })
        .table('xml_suspensiones')
        .where("id", id)
        .then(() => {
            return true;
        })
        .catch(e => {
            return false;
        });
}

async function UpdateEmpleadoXmlSignature(id, employee) {
    return await db.pg.update({
        signature_employee: true,
        signature_employee_datetime: moment(),
        signature_employee_name: employee.nombres + " " + employee.apellidos

    })
        .table('xml_suspensiones')
        .where("id", id)
        .then(() => {
            return true;
        })
        .catch(e => {
            console.log("ERRO: " + e);
            return false;
        });
}

async function VerifyXmlSignature(xmlId, signatureType) {
    return db.pg.select('*')
        .table('xml_suspensiones')
        .where('id', xmlId)
        .then(xmls => {
            switch (signatureType) {
                case 'DIRECTOR':
                    if (xmls[0].signature_director == true) {
                        return { status: "signed" }
                    } else {
                        return { status: false }
                    }
                case 'RRHH':
                    if (xmls[0].signature_rrhh == true) {
                        return { status: "signed" }
                    } else {
                        return { status: false }
                    }
                case 'EMPLEADO':
                    if (xmls[0].signature_employee == true) {
                        return { status: "signed" }
                    } else {
                        return { status: false }
                    }

                default:
                    return { status: false }
            }
        })
        .catch(err => {
            return { status: 'error', message: "Error selecting XML: " + err };
        });
}

async function UpdateXmlStatus(id) {
    return db.pg.select("*")
        .table('xml_suspensiones')
        .where('id', id)
        .then(xmls => {
            let status = 'PEN';

            //VERIFICA SE PELO MENOS UMA ASSINATURA FOI FEITA
            if (xmls[0].signature_director || xmls[0].signature_rrhh || xmls[0].signature_employee) {
                status = 'ENP';
            }

            //VERIFICA SE TODAS AS ASSINATURAS JÁ FORAM FEITAS
            if (xmls[0].signature_director && xmls[0].signature_rrhh && xmls[0].signature_employee) {
                status = 'COM';
            }

            //VERIFICA SE ESTÁ COMPLETO TARDIO
            // if (xmls[0].signature_director && xmls[0].signature_rrhh && xmls[0].signature_employee && moment(document.end_date).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
            //     status = 'TAR';
            // }

            console.log('updating xml');
            return db.pg.update({
                status: status
            })
                .table('xml_suspensiones')
                .where("id", id)
                .then(() => {
                    return true;
                })
        })
        .catch(err => {
            return { status: 'error', message: "Error updating XML status: " + err };
        });
}

async function UpdateDocumentStatus(documentId) {
    //busca o status de todos os xmls do documento
    let arrayDeStatus = await GetXmlsStatus(documentId);

    let status = 'ENP';

    //caso todas as assinaturas de todos os xmls estejam true, será COM
    if (arrayDeStatus.every(checkCom)) {
        status = 'COM';
    }

    //caso alguma das assinaturas seja tardia, será TAR
    if (arrayDeStatus.includes('TAR')) {
        status = 'TAR';
    }

    return db.pg.update({
        status: status
    })
        .table('xml_suspensiones')
        .where('id', documentId)
        .then(() => {
            return true;
        });
}

function checkCom(value) {
    return value === 'COM';
}

async function GetXmlsStatus(documentId) {
    return db.pg.select('xml.status')
        .table('xml_suspensiones')
        .where('id', documentId)
        .then(records => {
            var results = records.map(record => {
                return record.status;
            })

            return results;
        });
}

async function SaveHashKude(xmlId, hashKude) {
    return db.pg
        .where('id', xmlId)
        .table('xml_suspensiones')
        .update({
            hash_kude: hashKude
        })
        .then(() => {

        })
        .catch(e => {

        });
}

module.exports = router;
