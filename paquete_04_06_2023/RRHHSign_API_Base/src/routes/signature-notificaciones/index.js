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
const { IncomingForm } = require("formidable");

router.get('/', async(req, res, next) => {
    let query = db.pg
        .table("xml_notificaciones")
        .join('employee', 'employee.id', 'xml_notificaciones.employee_id')
        .select('xml_notificaciones.*', 'employee.nombres', 'employee.apellidos');

    if (req.query.group_id) {
        query = query.where('xml_notificaciones.grupo_notificacion_id', req.query.group_id)
    }

    query
        .then((notificaciones) => {
            if (notificaciones.length === 0) {
                return res.status(200).json({
                    status: "error",
                    data: "Notificaciones no encontradas"
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    data: notificaciones
                });
            }
        })
})

router.get('/grupconcept', async(req, res, next) => {
    let query = db.pg
        .table('xml_notificaciones')
        .join('user_group', 'xml_notificaciones.user_group_id', 'user_group.id')
        .distinct('xml_notificaciones.titulo')
        .select('xml_notificaciones.user_group_id', 'xml_notificaciones.grupo_notificacion_id', 'user_group.name', 'xml_notificaciones.fecha', 'xml_notificaciones.titulo')
        .orderBy('xml_notificaciones.fecha', 'desc');
    /*if (req.query.user_email) {
        query = query.whereIn('employee_id', function() {
            return this.table('employee')
                .select('id')
                .where('email', req.query.user_email)
        })
    }*/

    /*if (req.query.title) {
        query = query.where('titulo', 'like', `%${req.query.title}%`)
    }

    if (req.query.fecha) {
        query = query.where('fecha', req.query.fecha)
    }*/
    query
        .then(async(notificaciones) => {
            if (notificaciones.length === 0) {
                return res.status(200).json({
                    status: "error",
                    data: "Notificaciones no encontradas"
                });
            } else {
                for (var i = 0; i < notificaciones.length; i++) {
                    notificaciones[i].cant = await grupcant(notificaciones[i].grupo_notificacion_id);
                    notificaciones[i].firm = await grupfirm(notificaciones[i].grupo_notificacion_id);
                }
                return res.status(200).json({
                    status: "success",
                    data: notificaciones
                });
            }
        })
})

async function grupcant(group) {
    return await db.pg('xml_notificaciones')
        .count('id AS cant')
        .where('grupo_notificacion_id', group)
        .then((result) => {
            return result[0].cant;
        })
}

async function grupfirm(group) {
    return await db.pg('xml_notificaciones')
        .count('id AS cant')
        .where({
            grupo_notificacion_id: group,
            signature_employee: 1
        })
        .then((result) => {
            return result[0].cant
        });
}


router.get('/grupos', async(req, res, next) => {
    /* let query = db.pg
    .table("grupo_notificacion")
    //.innerJoin('xml_notificaciones', 'grupo_notificaciones.id', 'xml_notificaciones.grupo_notificacion_id')

    if (req.query.user_email) {
        query = query.whereIn('user_group_id', function () { 
            return this.table('xml_notificaciones')
            .select('user_group_id')
            .whereIn('employee_id', function () {
                return this.table('employee')
                .select('id')
                .where('email', req.query.user_email)
            })
        })
    } */
    let query = db.pg
        .table("xml_notificaciones")
        .join('employee', 'xml_notificaciones.employee_id', 'employee.id')
        .select('xml_notificaciones.id', 'xml_notificaciones.created_at', 'xml_notificaciones.fecha', 'xml_notificaciones.titulo', 'xml_notificaciones.user_group_id', 'employee.nombres', 'employee.apellidos', 'xml_notificaciones.signature_employee')
        .orderBy('xml_notificaciones.fecha', 'desc');

    if (req.query.user_email) {
        query = query.whereIn('employee_id', function() {
            return this.table('employee')
                .select('id')
                .where('email', req.query.user_email)
        })
    }

    if (req.query.title) {
        query = query.where('titulo', 'like', `%${req.query.title}%`)
    }

    if (req.query.fecha) {
        query = query.where('fecha', req.query.fecha)
    }

    query
        .then((notificaciones) => {
            if (notificaciones.length === 0) {
                return res.status(200).json({
                    status: "error",
                    data: "Notificaciones no encontradas"
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    data: notificaciones
                });
            }
        })
})

router.get('/idgroup/:id', async(req, res, next) => {
    db.pg('xml_notificaciones').where('id', req.params.id).select('user_group_id').then((result => {
        return res.status(200).json({
            status: "success",
            data: result
        });
    }))
})

router.get('/:group_id/:user_email/:id', async(req, res, next) => {
    await db.pg('employee').where('email', req.params.user_email.split('=')[1]).then(async(result) => {
        await db.pg
            .table("xml_notificaciones")
            .where({ 'xml_notificaciones.user_group_id': req.params.group_id.split('=')[1], 'xml_notificaciones.employee_id': result[0].id, 'xml_notificaciones.id': req.params.id.split('=')[1] })
            .join('employee', 'employee.id', 'xml_notificaciones.employee_id')
            .select('xml_notificaciones.*', 'employee.nombres', 'employee.apellidos', 'employee.identification', 'employee.ips_empleado', 'employee.email')
            .then((notificaciones) => {
                if (notificaciones.length === 0) {
                    return res.status(200).json({
                        status: "error",
                        data: "Notificación no encontrada"
                    });
                } else {
                    return res.status(200).json({
                        status: "success",
                        data: notificaciones[0]
                    });
                }
            })
    })
})

/*router.get('/:id', async(req, res, next) => {
    await db.pg
        .table("xml_notificaciones")
        .where({ 'xml_notificaciones.id': req.params.id })
        .join('employee', 'employee.id', 'xml_notificaciones.employee_id')
        .select('xml_notificaciones.*', db.pg.raw(`encode(xml_notificaciones.pdf_document, \'base64\') as pdf`), 'employee.nombres', 'employee.apellidos', 'employee.identification', 'employee.ips_empleado', 'employee.email')
        .then((notificaciones) => {
            if (notificaciones.length === 0) {
                return res.status(200).json({
                    status: "error",
                    data: "Notificación no encontrada"
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    data: notificaciones[0]
                });
            }
        })
})*/

router.get('/:id', async(req, res, next) => {
    let fileContent = '';
    await db.pg
        .table("xml_notificaciones")
        .where('xml_notificaciones.id', req.params.id)
        .join('employee', 'employee.id', 'xml_notificaciones.employee_id')
        .select('xml_notificaciones.*', 'employee.nombres', 'employee.apellidos', 'employee.identification', 'employee.ips_empleado', 'employee.email')
        .then((notificaciones) => {
            let buff = new Buffer(notificaciones[0].pdf_document);
            fileContent = buff.toString('base64');

            if (notificaciones.length === 0) {
                return res.status(200).json({
                    status: "error",
                    data: "Notificación no encontrada"
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    data: notificaciones[0],
                    pdf: fileContent
                });
            }
        })
})


router.post("/new", async(req, res, next) => {
    var company = await GetCompany();
    let data = 'Notificación nueva ' + req.body.employee_id + ', ' + req.body.motivo;
    utils.insertLogs(req.body.creator, data);
    var employees = await db.pg('employee')
        .select('id')
        .whereIn('user_id', function() { return this.table('user_user_group').select('user_id').where('user_group_id', req.body.user_group_id); })

    console.log('Employees: ', employees)

    if (company !== false) {
        const grupo = await db.pg('grupo_notificacion')
            .insert({
                grupo_notificacion: req.body.user_group_id,
                fecha: req.body.fecha,
                titulo: req.body.titulo,
                document: false,
            })
            .returning('id')

        console.log('Company true')
        console.log('Cant emple: ', employees.length)
        Promise.all(employees.map(async employee => {
                console.log('Emple: ', employee)
                return db.pg.insert({
                        employee_id: employee.id,
                        company_id: company.id,
                        user_group_id: req.body.user_group_id,
                        grupo_notificacion_id: grupo[0],
                        titulo: req.body.titulo,
                        texto: req.body.texto,
                        fecha: req.body.fecha,
                    })
                    .table("xml_notificaciones")
                    .returning("*")
            }))
            .then(async xmls => {
                res.send({
                    status: 'success',
                })
            })
            .catch(e => {
                console.log('ERRO AO INSERIR XML: ' + e);
                res.send({ status: false, message: 'Falha na inclusão de xmls: ' + e });
                //return false;
            });
    } else {
        console.log('Company false')
        res.send({ error: "Empresa no encontrada" })
    }
})

router.post("/newpdf", async(req, res, next) => {
    var company = await GetCompany();
    var form = new IncomingForm();
    form.parse(req, async(err, fields, files) => {
        //let data ='Notificación nueva ' + fields.employee_id + ', ' + fields.motivo;
        //utils.insertLogs(fields.creator, data);
        var employees = await db.pg('employee')
            .select('id')
            .whereIn('user_id', function() {
                return this.table('user_user_group').select('user_id').where('user_group_id', fields.userGroup);
            })

        console.log('Employees: ', employees)

        if (company !== false) {
            if (files) {
                if (files.file.size > 6000000) {
                    res.send({
                        status: 'error',
                        message: 'file size error'
                    })
                    return 0;
                }
                fecha_noti = moment(fields.selectedStartDate).format("YYYY-MM-DD");
                const grupo = await db.pg('grupo_notificacion')
                    .insert({
                        grupo_notificacion: fields.userGroup,
                        fecha: fecha_noti,
                        titulo: fields.titulo,
                        document: true,
                    })
                    .returning('id')
                let fileContent = '';
                //fileContent = await readFile(files);
                fileContent = fs.readFileSync(files.file.path);
                //fileContent = await db.pg.raw(`SELECT replace('${fileContent}', \u0000, ''`).then((result) => { return result; }).catch((e) => { return e; });
                //let buff = new Buffer(fileContent);
                //fileContent = buff.toString('base64');
                //fileContent = fileContent.replace(/^\u0000/g, '');
                console.log('Company true')
                console.log('Cant emple: ', employees.length)
                Promise.all(employees.map(async employee => {
                        console.log('Emple: ', employee)
                        return db.pg.insert({
                                employee_id: employee.id,
                                company_id: company.id,
                                user_group_id: fields.userGroup,
                                grupo_notificacion_id: grupo[0],
                                titulo: fields.titulo,
                                texto: fields.texto,
                                fecha: fecha_noti,
                                pdf_document: fileContent,
                                verificado: false
                            })
                            .table("xml_notificaciones")
                            .returning("*")
                            //
                    }))
                    .then(async xmls => {
                        res.send({
                            status: 'success',
                        })
                    })
                    .catch(e => {
                        console.log('ERRO AO INSERIR XML: ' + e);
                        res.send({ status: false, message: 'Falha na inclusão de xmls: ' + e });
                        //return false;
                    });
            } else {
                const grupo = await db.pg('grupo_notificacion')
                    .insert({
                        user_group_id: fields.userGroup,
                        fecha: moment(fields.selectedStartDate).format("YYYY-MM-DD"),
                        titulo: fields.titulo,
                        document: false,
                    })
                    .returning('id')
                console.log('Company true')
                console.log('Cant emple: ', employees.length)
                Promise.all(employees.map(async employee => {
                        console.log('Emple: ', employee)
                        return db.pg.insert({
                                employee_id: employee.id,
                                company_id: company.id,
                                user_group_id: fields.userGroup,
                                grupo_notificacion_id: grupo[0],
                                titulo: fields.titulo,
                                texto: fields.texto,
                                fecha: moment(fields.selectedStartDate).format("YYYY-MM-DD"),
                                verificado: false
                            })
                            .table("xml_notificaciones")
                            .returning("*")
                    }))
                    .then(async xmls => {
                        res.send({
                            status: 'success',
                        })
                    })
                    .catch(e => {
                        console.log('ERRO AO INSERIR XML: ' + e);
                        res.send({ status: false, message: 'Falha na inclusão de xmls: ' + e });
                        //return false;
                    });
            }
        } else {
            console.log('Company false')
            res.send({ error: "Empresa no encontrada" })
        }
    })
})

async function readFile(file) {
    /* const promise = await new Promise((resolve, reject) => {
        fs.readFile(file.file.path, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data.toString());
        });
    });
    return promise; */
    return fs.readFileSync(file);
}

router.post("/sign", async function(req, res, next) {
    try {
        //busca a empresa
        let data = 'Preaviso firma ' + req.body.user_email;
        utils.insertLogs(req.body.user_email, data);
        return db.pg.select("*")
            .table("company")
            .then(async companies => {
                //BUSCA O EMPREGADO

                var employee = await GetEmployeeByEmail(req.body.user_email);

                //AJUSTA O PATH DE ACORDO COM O CI
                var path = "empresa-" + companies[0].ruc + "/ci-" + employee.identification;

                //BUSCA O USUÁRIO DO EMPREGADO PARA DESCOBRIR O TIPO
                var signatureType = await GetSignatureType(employee.identification, req.body.user_profile);


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
                    .table('xml_notificaciones')
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
                                            .table('xml_notificaciones')
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

async function GetSignatureType(identification, perfil) {
    return await db.pg.select("*")
        .from("employee")
        .join("usuario", "employee.user_id", "usuario.id")
        .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
        .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
        .where("employee.identification", identification)
        .where("user_profile.profile_slug", perfil)
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
    var hash_kude = "01" + moment(xmlObj.fecha_de_pago).format("DDMMYYYY") + moment().format("DDMMYYYYHHmm") + employee.mtess_patronal + employee.identification;

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
            "<suspensionJudicial>" + (xmlObj.suspension_judicial ? 'true' : 'false') + "</suspensionJudicial>" +
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
            signature_director_name: employee.nombres + " " + employee.apellidos,
            signature_employee_holograph: employee.firma_holografa,
        })
        .table('xml_notificaciones')
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
            signature_employee_holograph: employee.firma_holografa,
        })
        .table('xml_notificaciones')
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
            signature_employee_name: employee.nombres + " " + employee.apellidos,
            signature_employee_holograph: employee.firma_holografa,

        })
        .table('xml_notificaciones')
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
        .table('xml_notificaciones')
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
        .table('xml_notificaciones')
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
                .table('xml_notificaciones')
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
        .table('xml_notificaciones')
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
        .table('xml_notificaciones')
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
        .table('xml_notificaciones')
        .update({
            hash_kude: hashKude
        })
        .then(() => {

        })
        .catch(e => {

        });
}

module.exports = router;