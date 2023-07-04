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
var aes256 = require('aes256');
const axios = require('axios');

router.post("/sign", async function(req, res, next) {
    try {
        //busca a empresa
        var key = db.pg.select('ruc', 'razon_social').table('company').then(function(values) {
            var key = values[0]['ruc'] + values[0]['razon_social'];
            var value = req.body.user_email;
            var perfil = req.body.user_profile;
            var email = aes256.decrypt(key, value);
            value = req.body.pin;
            var pass = aes256.decrypt(key, value);
            let data = 'Firmar todo ' + req.body.user_email;
            utils.insertLogs(req.body.user_email, data);
            utils.insertLogs(req.body.user_email, data);
            return db.pg.select("*")
                .table("company")
                .then(async companies => {
                    //BUSCA O EMPREGADO

                    var employee = await GetEmployeeByEmail(email);
                    console.log("EMAIL: " + email);

                    //AJUSTA O PATH DE ACORDO COM O CI
                    var path = "empresa-" + companies[0].ruc + "/ci-" + employee.identification;

                    //BUSCA O USUÁRIO DO EMPREGADO PARA DESCOBRIR O TIPO
                    var signatureType = await GetSignatureType(email, perfil);

                    if (signatureType === false) {
                        return res.status(200).json({
                            status: "error",
                            data: "Perfil de usuario inválido"
                        });
                    }

                    //COMANDOS
                    var comandoPrivate = `openssl pkcs12 -in certificates/${path}/certificate.pfx -out certificates/${path}/private.pem -passin pass:${pass} -nodes`;
                    var comandoPublic = `openssl pkcs12 -in openssl/certificates/${path}/certificate.pfx -clcerts -nokeys -passin pass:${pass} | awk '/BEGIN/ { i++; } /BEGIN/, /END/ { print > "openssl/certificates/${path}/public.pem" }'`;

                    //BUSCA XML NO BD OU MONTA XML CASO NÃO EXISTA AINDA
                    return db.pg.select("*")
                        .table("xml_comprobante_pago")
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
                                    return exec(comandoPublic, async(err, stdout, stderr) => {
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
                                                .table("xml_comprobante_pago")
                                                .where("id", req.body.id)
                                                .returning("*")
                                                .then(async xmls => {
                                                    //ATUALIZA O STATUS DA ASSINATURA DO XML DE ACORDO COM O PERFIL DE USUÁRIO
                                                    var updateXmlSignature = await UpdateXmlSignature(xmls[0].id, signatureType, employee);
                                                    console.log('error sign: ', updateXmlSignature)
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
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/:id/rejections', async(req, res, next) => {
    db.pg("rejection")
        .where('xml_id', req.params.id)
        .join('usuario', 'rejection.user_id', 'usuario.id')
        .select('rejection.*', 'usuario.name')
        .orderBy('rejection.created_at', 'desc')
        .then(result => res.status(200).json({
            status: 'success',
            data: result
        }))
        .catch(e => {
            console.log('Error querying rejections: ', e)
            return res.status(200).json({
                status: 'error',
                data: e
            })
        })
})

router.post('/:id/rejections', async(req, res, next) => {
    let data = 'Comprobante rechazado ' + req.body.user_email;
    utils.insertLogs(req.body.user_email, data);
    const user = await db.pg('usuario').select('id').where('email', req.body.user_email)

    const recepients = await db.pg('usuario').select('email')
        .whereIn('profile_id', function() { return this.select('id').from('user_profile').whereIn('profile_slug', ['rh', 'rh_not_signer']) })
        .orWhere('id', user[0].id)

    db.pg('rejection')
        .insert({
            user_id: user[0].id,
            xml_id: req.params.id,
            message: req.body.message,
        })
        .then(() => EnviaEmailRechazo(recepients))
        .then(() => res.status(200).json({
            status: 'success',
        }))
        .catch(e => {
            console.log('Error inserting rejection: ', e)
            return res.status(200).json({
                status: 'error',
                data: e
            })
        })
})

async function EnviaEmailRechazo(users) {
    let to = users.map(user => user.email)

    let email = {
        from: 'DigitaLife',
        to: to, //to,
        subject: 'Nuevo menzaje de rechazo',
        // template: 'new-user'
        html: `<h1>Hola!<h1><br>Fue agregado un nuevo menzaje de rechazo a un recibo de salario.`
    };
    // return await axios.post('https://dataflow.code100sa.com.py/api/email/send', email)
    return await utils.sendMail(email)
}

async function GetSignatureType(email, perfil) {
    return await db.pg.select("*")
        .from("employee")
        .join("usuario", "employee.user_id", "usuario.id")
        .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
        .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
        .where("employee.email", email)
        .where("user_profile.profile_slug", perfil)
        //.options({nestTables: true})
        .then(employees => {
            console.log(email);
            console.log(employees[0].profile_slug);
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
    // GET PATRONAL
    var patronal = await GetPatronal(company.id, employee.mtess_patronal);
    //GET XML --> VEM NOS PARÂMETROS
    //GET XML DETAILS
    var xmlDetails = await GetXMLDetails(xmlObj.id);

    // console.log("xmlObj: " + JSON.stringify(xmlObj));
    // console.log("company: " + JSON.stringify(company));
    // console.log("employee: " + JSON.stringify(employee));
    // console.log("xmlDetails: " + JSON.stringify(xmlDetails));

    //TIPODOCUMENTO + DIAPAGO + MESPAGO + ANOPAGO + DIACREACION + MESCREACION + ANOCREACION + HORACREACION + 
    //MINUTOCREACION + NROMTESSPATRONAL + NROIPSEMPLEADO
    var hash_kude = "01" + moment(xmlObj.fecha_de_pago).format("DDMMYYYY") + moment().format("DDMMYYYYHHmm") + employee.mtess_patronal + employee.identification;

    await SaveHashKude(xmlObj.id, hash_kude);

    try {

        var xml =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<dRS xmlns="http://firma.mtess.gov.py/xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://firma.mtess.gov.py/xsd siRecepDE_v150.xsd">' +
            '<dVerFor>005</dVerFor>' +
            "<hashKude>" + hash_kude + "</hashKude>" +
            "<RS>" +
            "<encabezado>" +
            "<llave>" + patronal.hash + "</llave>" +
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
            "<detalles>" + xmlDetails + "</detalles>" +
            "<pie>" +
            "<totalIngresos>" + xmlObj.total_ingresos + "</totalIngresos>" +
            "<totalRetenciones>" + xmlObj.total_retenciones + "</totalRetenciones>" +
            "<totalNeto>" + xmlObj.total_neto + "</totalNeto>" +
            "<netoEnLetras>" + xmlObj.neto_en_letras + "</netoEnLetras>" +
            "</pie>" +
            "</RS>" +
            "<SignatureRRHH>" +
            "</SignatureRRHH>" +
            "<SignatureDIRECTOR>" +
            "</SignatureDIRECTOR>" +
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
        .where('id', id)
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
        .join("xml_comprobante_pago", 'xml.document_id', 'document.id')
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

async function GetPatronal(companyId, mtessPatronal) {
    return await db.pg.select('*')
        .table('patronal')
        .where('company_id', companyId)
        .where('mtess_patronal', mtessPatronal)
        .then(patronal => {
            if (patronal.length > 0) {
                return patronal[0];
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

async function GetXMLDetails(xmlId) {
    return await db.pg.select("*")
        .table('xml_comprobante_pago_items')
        .where('xml_id', xmlId)
        .then(detailsList => {
            var resultDetails = detailsList.map(details => {
                return "<detalle_item>" +
                    "<conceptos>" + details.descripcion + "</conceptos>" +
                    "<unidades>" + details.unidades + "</unidades>" +
                    "<ingresos>" + details.ingresos + "</ingresos>" +
                    "<retenciones>" + details.retenciones + "</retenciones>" +
                    "</detalle_item>";
            });

            return resultDetails;
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
            signature_director_name: employee.nombres + " " + employee.apellidos,
            signature_director_holograph: employee.firma_holografa,
        })
        .table("xml_comprobante_pago")
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
            signature_rrhh_name: employee.nombres + " " + employee.apellidos,
            signature_rrhh_holograph: employee.firma_holografa,
        })
        .table("xml_comprobante_pago")
        .where("id", id)
        .then(() => {
            return true;
        })
        .catch(e => {
            console.log('Error updating rrhh signature: ', e)
            return false;
        });
}

async function UpdateEmpleadoXmlSignature(id, employee) {
    return await db.pg.update({
            signature_employee: true,
            signature_employee_datetime: moment(),
            signature_employee_name: employee.nombres + " " + employee.apellidos,
            signature_employee_holograph: employee.firma_holografa,

        })
        .table("xml_comprobante_pago")
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
        .table("xml_comprobante_pago")
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
        .table("xml_comprobante_pago")
        .where('id', id)
        .then(xmls => {
            let status = 'PEN';

            //VERIFICA SE PELO MENOS UMA ASSINATURA FOI FEITA
            if (xmls[0].signature_director || xmls[0].signature_rrhh || xmls[0].signature_employee) {
                status = 'ENP';
            }

            //VERIFICA SE TODAS AS ASSINATURAS JÁ FORAM FEITAS
            if (xmls[0].signature_director && xmls[0].signature_employee) {
                status = 'COM';
            }

            console.log('updating xml');
            return db.pg.update({
                    status: status
                })
                .table("xml_comprobante_pago")
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
        .table('document')
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
        .table('document')
        .join("xml_comprobante_pago", 'xml.document_id', 'document.id')
        .where('document.id', documentId)
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
        .table("xml_comprobante_pago")
        .update({
            hash_kude: hashKude
        })
        .then(() => {

        })
        .catch(e => {

        });
}

router.post("/signall", async function(req, res, next) {
    try {
        //busca a empresa
        var key = db.pg.select('ruc', 'razon_social').table('company').then(function(values) {
            var key = values[0]['ruc'] + values[0]['razon_social'];
            var value = req.body.user_email;
            var email = aes256.decrypt(key, value);
            value = req.body.pin;
            var pass = aes256.decrypt(key, value);
            let data = 'Firmar todo ' + req.body.user_email;
            utils.insertLogs(req.body.user_email, data);
            //utils.insertLogs(req.body.user_email, data);
            return db.pg.select("*")
                .table("company")
                .then(async companies => {
                    //BUSCA O EMPREGADO
                    var employee = await GetEmployeeByEmail(email);

                    //AJUSTA O PATH DE ACORDO COM O CI
                    var path = "empresa-" + companies[0].ruc + "/ci-" + employee.identification;

                    //BUSCA O USUÁRIO DO EMPREGADO PARA DESCOBRIR O TIPO
                    var signatureType = await GetSignatureType(email);


                    if (signatureType === false) {
                        return res.status(200).json({
                            status: "error",
                            data: "Perfil de usuario inválido"
                        });
                    }

                    //COMANDOS
                    var comandoPrivate = `openssl pkcs12 -in certificates/${path}/certificate.pfx -out certificates/${path}/private.pem -passin pass:${pass} -nodes`;
                    var comandoPublic = `openssl pkcs12 -in openssl/certificates/${path}/certificate.pfx -clcerts -nokeys -passin pass:${pass} | awk '/BEGIN/ { i++; } /BEGIN/, /END/ { print > "openssl/certificates/${path}/public.pem" }'`;
                    //CONVERTE CHAVE PRIVADA
                    return openssl(comandoPrivate, (err, buffer) => {
                        if (err.toString() === "") {
                            //CONVERTE CHAVE PÚBLICA
                            //openssl(comandoPublic, (err, buffer) => {
                            return exec(comandoPublic, async(err, stdout, stderr) => {
                                if (!err) {
                                    //BUSCA XML NO BD OU MONTA XML CASO NÃO EXISTA AINDA
                                    return db.pg.select("*")
                                        .table("xml_comprobante_pago")
                                        .where("document_id", req.body.documentId)
                                        .then(async xmls => {
                                            Promise.all(xmls.map(async xml_record => {

                                                var xml = xml_record.xml;

                                                if (xml === null) {
                                                    //CRIA O XML
                                                    xml = await GetXML(xml_record);
                                                }

                                                //VERIFICA SE ESSE XML JÁ FOI ASSINADO PELO PERFIL QUE ESTÁ TENTANDO ASSINAR TODOS
                                                var responseVerify = await VerifyXmlSignature(xml_record.id, signatureType);

                                                if (responseVerify.status === 'signed') {
                                                    return res.status(200).json({
                                                        status: "error",
                                                        data: "No es posible firmar por lotes en este momento. Es posible que algunos documentos ya estén firmados. Firma individualmente."
                                                    });
                                                } else if (responseVerify.status === 'error') {
                                                    return res.status(200).json({
                                                        status: "error",
                                                        data: "Error al verificar la firma en XML."
                                                    });
                                                } else {
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
                                                        .table("xml_comprobante_pago")
                                                        .where("id", xml_record.id)
                                                        .returning("*")
                                                        .then(async xmls => {
                                                            //ATUALIZA O STATUS DA ASSINATURA DO XML DE ACORDO COM O PERFIL DE USUÁRIO
                                                            var updateXmlSignature = await UpdateXmlSignature(xmls[0].id, signatureType, employee);
                                                            if (!updateXmlSignature) {
                                                                return res.status(200).json({
                                                                    status: "error",
                                                                    data: "Error al actualizar la firma en XML"
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
                                                            UpdateDocumentStatus(document.id);

                                                        })
                                                        .catch(e => {
                                                            return res.status(200).json({
                                                                status: "error",
                                                                data: "Error al actualizar XML: " + e
                                                            });
                                                        });
                                                }
                                            })).then(results => {
                                                //RETORNA STATUS 200
                                                return res.status(200).json({
                                                    status: "success",
                                                    data: "Documentos firmados exitosamente"
                                                });
                                            });
                                        })
                                        .catch(e => {
                                            if (signatureType === false) {
                                                return res.status(200).json({
                                                    status: "error",
                                                    data: "Error al buscar XML"
                                                });
                                            }
                                        });

                                } else {
                                    return res.status(200).json({
                                        status: "error",
                                        data: "Error al convertir llave pública: " + err
                                    });
                                }
                            });
                        } else {
                            return res.status(200).json({
                                status: "error",
                                data: "Error al convertir llave privada: " + err
                            });
                        }
                    });
                });
        })
    } catch (error) {
        return res.status(200).json({
            status: "error",
            data: "Error general: " + error
        });
    }
});

router.post('/:id/deactivate', (req, res, next) => {
    let data = 'Comprobante desactivación ' + req.body.creator;
    utils.insertLogs(req.body.user_email, data);
    db.pg.update({
            status: 'DES',
            motivo_desactivacion: req.body.motivo_desactivacion,
        })
        .table("xml_comprobante_pago")
        .where('id', req.params.id)
        .then(() => {
            return res.status(200).json({
                status: 'ok'
            })
        })
        .catch(e => {
            console.log('ERROR DEACTIVATING XML: ', e)
            return res.status(200).json({
                status: 'error',
                data: e,
            })
        })
})

module.exports = router;