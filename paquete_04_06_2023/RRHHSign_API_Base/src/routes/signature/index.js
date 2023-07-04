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

const path = require("path");
const uuidv4 = require("uuid/v4");

const {
    StandardSignaturePolicies,
    XmlSigner,
    TrustServicesManager,
    TrustServiceSessionTypes,
    CertificateExplorer
} = require("pki-express");

const { Util } = require("../../util");
const { StorageMock } = require("../../storage-mock");
/**
 * This sample is responsible to perform a OAuth flow to communicate with PSCs to perform a
 * signature. To perform this sample it's necessary to configure PKI Express with the credentials of
 * the services by executing the following sample:
 *
 *    pkie config --set trustServices:<provider>:<configuration>
 *
 * All standard providers:
 *    - BirdId
 *    - ViDaaS
 *    - NeoId
 *    - RemoteId
 *    - SafeId
 * It's possible to create a custom provider if necessary.
 *
 * All configuration available:
 *    - clientId
 *    - clientSecret
 *    - endpoint
 *    - provider
 *    - badgeUrl
 *    - protocolVariant (error handling, normally it depends on the used provider)
 *
 * This sample will only show the PSCs that are configured.
 **/

const APP_ROOT = process.cwd();

// Redirect URL used by service provider to return the "code" and "state" value
//http://localhost:3000
const REDIRECT_URL = process.env.REDIRECT_URL + "/tsp-callback/";

/**
 * GET /xml-cloud-oauth-express
 *
 * This action will render a page for the user to choose one of the available
 * providers, which were configured by the command above.
 *
 */

//iniciar la sesion de firma
router.get("/", async (req, res, next) => {
    // Get an instance of the TrustServiceManager class, responsible for
    // communicating with PSCs and handling the OAuth flow. And set common
    // configuration with setPkiDefaults (see util.js).
    const manager = new TrustServicesManager();
    Util.setPkiDefaults(manager);

    // Available Session Configuration:
    const sessionType = TrustServiceSessionTypes.SIGNATURE_SESSION; // see TrustServiceSessionTypes for more options
    //const sessionLifetime = (30 * 60).toString(); // The time the session token will be valid after authorization

    // We will use a sessionId to identify the code and state in the front-end
    // to be used in the callback page (see tsp-callback.js file)
    const sessionId = uuidv4();

    // Start authentication with available
    const result = await manager.startAuth(
        REDIRECT_URL,
        sessionType,
        null,
        sessionId // Persist sessionId in custom state parameter
    );
    const authParameters = result.authParameters;

    return res.status(200).json({
        auth: authParameters,
        session_id: sessionId
    })

});

router.post("/getSessionId", async (req, res, next) => {
    console.log(req.body)
    var signature_session = await db.pg.table('signature_sessions').where('session_id', 'like', req.body.session_id)

    if (signature_session.length > 0) {
        return res.status(200).json({
            status: 'success',
            data: signature_session
        })
    } else {
        return res.status(200).json({
            status: 'pending',
            data: signature_session
        })
    }

})

router.post("/sign", async function (req, res, next) {

    var xml_id = req.body.xml_id
    var code = req.body.code;
    var state = req.body.state;
    var sessionId = req.body.session_id
    var user_email = req.body.user_email;
    var user_profile = req.body.user_profile;
    var empresa = await db.pg.table('company')
    var key = empresa[0].ruc + empresa[0].razon_social;
    var control = await db.pg.table('control')
    var controlSignRH = await db.pg('control_sign').where('sign_type', '3')
    var email = aes256.decrypt(key, user_email);
    var perfil = aes256.decrypt(key, user_profile);
    if (req.body.pin) {
        var pin = aes256.decrypt(key, req.body.pin);
        var pass = await utils.replaceChar(pin);
    } else {
        var pin = ''
        var pass = await utils.replaceChar(pin);
    }

    try {

        let fecha_xml = "";
        let mes_de_pago = "";

        if (perfil == 'funcionario') {
            console.log("firma funcionario")

            await db.pg.select("document.start_date", "xml.mes_de_pago", "xml.numero_recibo")
                .table("document")
                .join('xml', 'xml.document_id', 'document.id')
                .where("xml.id", xml_id)
                .then(async xml => {
                    fecha_xml = xml[0].start_date
                    mes_de_pago = xml[0].mes_de_pago
                    numero_recibo = xml[0].numero_recibo
                })

            var fechaPago = moment(mes_de_pago).format()
            var fecha = moment(fechaPago.toString().split("T")[0]).add(1, 'days')

            let data = 'Recibo del mes: ' + moment(fecha.toString().split("Moment")[0]).format("DD/MM/YYYY") + " con Rec. Nro.: " + numero_recibo;
            utils.insertLogs(email, data, 'Firma funcionario', 'INFO');

            var document = await db.pg.select("document.start_date")
                .table("document")
                .join('xml', 'xml.document_id', 'document.id')
                .join('employee', 'employee.id', 'xml.employee_id')
                .where("employee.email", email)
                .where("xml.signature_employee", false)
                .where('document.start_date', '<', fecha_xml)
                .where('document.status', '<>', 'DES')

            if (document.length > 0) {
                console.log("Existen documentos anteriores pendientes de firma, favor regularizar")
                let data = 'Existen documentos anteriores pendientes de firma, favor regularizar';
                utils.insertLogs(email, data, 'Firma funcionario', 'WARNING');
                return res.status(404).json({
                    status: "error",
                    data: "Existen documentos anteriores pendientes de firma, favor regularizar"
                });
            } else {
                console.log("Firmando")
            }
            //console.log(document)


        } else {
            console.log("firma director")
            await db.pg.select("document.start_date", "xml.mes_de_pago", "xml.numero_recibo")
                .table("document")
                .join('xml', 'xml.document_id', 'document.id')
                .where("xml.id", xml_id)
                .then(async xml => {
                    mes_de_pago = xml[0].mes_de_pago
                    numero_recibo = xml[0].numero_recibo
                })

            var fechaPago = moment(mes_de_pago).format()
            var fecha = moment(fechaPago.toString().split("T")[0]).add(1, 'days')

            let data = 'Recibo del mes: ' + moment(fecha.toString().split("Moment")[0]).format("DD/MM/YYYY") + " con Rec. Nro.: " + numero_recibo;
            utils.insertLogs(email, data, 'Firma Apoderado', 'INFO');
        }

        return db.pg.select("*")
            .table("company")
            .then(async companies => {
                //BUSCA O EMPREGADO

                var employee = await GetEmployeeByEmail(email);
                // console.log("EMAIL: " + req.body.user_email);

                console.log('ci: ', employee.identification)

                //AJUSTA O PATH DE ACORDO COM O CI
                var path_cert = "empresa-" + companies[0].ruc + "/ci-" + employee.identification;

                //BUSCA O USUÁRIO DO EMPREGADO PARA DESCOBRIR O TIPO
                var signatureType = await GetSignatureType(employee.email, perfil);

                if (signatureType === false) {
                    let data = 'Perfil de usuario no válido';
                    utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                    return res.status(200).json({
                        status: "error",
                        data: "Perfil de usuario no válido"
                    });
                }
                if (employee.cert_type == 'F1') {
                    //COMANDOS
                    var comandoPrivate = `openssl pkcs12 -in certificates/${path_cert}/certificate.pfx -out certificates/${path_cert}/private.pem -passin pass:${pass} -nodes`;
                    var comandoPublic = `openssl pkcs12 -in openssl/certificates/${path_cert}/certificate.pfx -clcerts -nokeys -passin pass:${pass} | awk '/BEGIN/ { i++; } /BEGIN/, /END/ { print > "openssl/certificates/${path_cert}/public.pem" }'`;
                    let dates = await utils.verifyCertDate(`openssl/certificates/${path_cert}/certificate.pfx`, pass);
                    //BUSCA XML NO BD OU MONTA XML CASO NÃO EXISTA AINDA

                    if (dates) {
                        if (dates.stderr) {
                            if (dates.stderr.indexOf('pass') > 0) {
                                let data = 'El pin suministrado no corresponde al certificado';
                                utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                                return res.status(200).json({
                                    status: "error",
                                    data: "El pin suministrado no corresponde al certificado"
                                });
                            } else {
                                let errMsg = ''
                                if (dates.stderr.indexOf('No such file or directory') != -1) {
                                    let data = 'El certificado aún no fue importado';
                                    utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                                    errMsg = 'Atención, El certificado aún no fue importado!'
                                } else {
                                    errMsg = dates.stderr;
                                }

                                console.log(dates.stderr)
                                return res.status(200).json({
                                    status: "error",
                                    data: errMsg
                                });
                            }
                        } else {
                            dates = dates.split('\n');
                            dateEnd = moment(dates[0].substring(10, dates[0].length)).format('YYYY-MM-DD');
                            dateStart = moment(dates[1].substring(9, dates[0].length)).format('YYYY-MM-DD');
                            console.log("cert_start=" + dateEnd + "cert_end=" + dateStart);
                        }
                    } else {
                        return res.status(200).json({
                            status: "error",
                            data: "Error en la verificación del certificado, el mismo no existe o el pin es erroneo"
                        });
                    }
                    await db.pg.update({ cert_start: dateEnd, cert_end: dateStart }).table('employee').where('identification', employee.identification);
                    if (!moment().isAfter(dateStart)) {
                        return db.pg.select("*")
                            .table("xml")
                            .where("id", xml_id)
                            .then(async xmls => {
                                var xml = xmls[0].xml;
                                if (xml === null) {
                                    //CRIA O XML
                                    xml = await GetXMLF1(xmls[0]);
                                }
                                //CONVERTE CHAVE PRIVADA
                                return openssl(comandoPrivate, async (err, buffer) => {
                                    console.log(err);
                                    if (err.toString() === "") {
                                        //CONVERTE CHAVE PÚBLICA
                                        //openssl(comandoPublic, (err, buffer) => {
                                        return exec(comandoPublic, async (err, stdout, stderr) => {
                                            console.log(err);
                                            if (!err) {
                                                //ASSINA
                                                var sig = new SignedXml();
                                                try {
                                                    var publicKey = fs.readFileSync(`./openssl/certificates/${path_cert}/public.pem`);
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
                                                    sig.signingKey = fs.readFileSync(`./openssl/certificates/${path_cert}/private.pem`);
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
                                                        .table("xml")
                                                        .where("id", xml_id)
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
                                                            //BUSCA O DOCUMENTO DO XML
                                                            var document = await GetDocument(xmls[0].id);
                                                            //ATUALIZA O STATUS DO XML
                                                            var updateXmlStatus = await UpdateXmlStatus(xmls[0].id, document);
                                                            if (!updateXmlStatus) {
                                                                return res.status(200).json({
                                                                    status: "error",
                                                                    data: "Error al actualizar el estado XML"
                                                                });
                                                            } else {
                                                                UpdateDocumentStatus(document.id)
                                                            }
                                                            //ATUALIZA O STATUS DO DOCUMENTO:

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
                                                        });
                                                } catch (error) {
                                                    let data = 'Error en lectura de Certificado, favor solicitar a RRHH un nuevo certificado';
                                                    utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                                                    return res.status(200).json({
                                                        status: "error",
                                                        data: "Error en lectura de Certificado, favor solicitar a RRHH un nuevo certificado"
                                                    });
                                                }
                                            } else {
                                                return res.status(200).json({
                                                    status: "error",
                                                    data: "Error al convertir la clave pública: " + err
                                                });
                                            }
                                        });
                                    } else {
                                        const errStr = err.toString()
                                        console.log('Cert. sign error: ', errStr)
                                        let errMsg = ''
                                        if (errStr.indexOf('Mac verify error: invalid password?') != -1) {
                                            errMsg = 'PIN inválido'
                                        } else if (errStr.indexOf('Cannot open input file') != -1) {
                                            errMsg = 'No se encuentra el certificado'
                                        } else {
                                            errMsg = "Error al convertir la clave privada: " + err
                                        }
                                        return res.status(200).json({
                                            status: "error",
                                            data: errMsg
                                        });
                                    }
                                });
                            })
                            .catch(e => {
                                if (signatureType === false) {
                                    return res.status(200).json({
                                        status: "error",
                                        data: "Error al obtener XML"
                                    });
                                }
                            });
                    } else {
                        let data = 'Certificado vencido:' + dateStart;
                        utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                        return res.status(200).json({
                            status: "error",
                            data: 'Certificado vencido, comuniquese con el emisor'
                        });
                    }
                } else if (employee.cert_type == 'F3') {

                    const manager = new TrustServicesManager();
                    Util.setPkiDefaults(manager);

                    console.log("manager: ", manager)

                    // Complete the authentication process, recovering the
                    // session info to be used on the signature and the
                    // custom state (fileId).
                    const result = await manager.completeAuth(code, state);

                    console.log("result: ", result)

                    const explorer = new CertificateExplorer();

                    console.log("explorer: ", explorer)

                    explorer.trustServiceSession = result.session;
                    const openResult = await explorer.open();

                    console.log("openResult: ", openResult)

                    if (control[0].produccion) {
                        if (employee.identification.trim() != openResult._certificate._pkiParaguay._ci.trim()) {
                            let data = 'La informacion de sesion no coincide con el certificado: ' + employee.email + "/" + openResult._certificate._pkiParaguay._ci;
                            utils.insertLogs(email, data, 'Firma ' + perfil, 'WARNING');
                            return res.status(200).json({
                                status: "error",
                                data: "Atención, la información de sesión no coincide con el certificado"
                            })
                        }
                    }

                    var fecha_emision = openResult._certificate._validityStart
                    var fecha_vencimiento = openResult._certificate._validityEnd

                    await db.pg.table('employee')
                        .update({
                            cert_start: moment(fecha_emision).format('YYYY-MM-DD HH:mm:ss'),
                            cert_end: moment(fecha_vencimiento).format('YYYY-MM-DD HH:mm:ss'),
                        }).where('id', employee.id)

                    if (moment().isAfter(fecha_vencimiento)) {
                        let data = 'El certificado ha expirado: ' + employee.email + "/" + fecha_vencimiento;
                        utils.insertLogs(email, data, 'Firma ' + perfil, 'WARNING');
                        return res.status(200).json({
                            status: "error",
                            data: "Atención, el certificado ha expirado"
                        })
                    } else {
                        // Get an instance of the XmlSigner class, responsible for receiving
                        // the signature elements and performing the local signature. And
                        // setting common configuration with setPkiDefaults (see util.js)
                        const signer = new XmlSigner();

                        console.log("signer: ", signer)

                        Util.setPkiDefaults(signer);

                        // Set signature policy
                        signer.signaturePolicy = StandardSignaturePolicies.XML_DSIG_BASIC;

                        return db.pg.select("*")
                            .table("xml")
                            .where("id", xml_id)
                            .then(async xmls => {

                                var xml = xmls[0].xml;
                                if (xml == null) {
                                    xml = await GetXML(xmls[0]);
                                }

                                fs.writeFileSync('src/public/documents/' + xmls[0].id + '.xml', xml);

                                if (fs.existsSync('src/public/documents/' + xmls[0].id + '.xml')) {
                                    await signer.setXmlToSignFromPath(path.join(APP_ROOT, 'src/public/documents/', xmls[0].id + '.xml'));
                                    /*generar el archivo en disco para que pueda leerlo*/
                                    // Set trust session acquired on the following steps of this sample.
                                    signer.trustServiceSession = result.session;
                                    // Generate path for output file and add the signature finisher.
                                    //const outputFile = xmls[0].id+'.xml';
                                    var outputFile = xmls[0].id + '.xml';
                                    StorageMock.createAppDataSync(); // Make sure the "app-data" folder exists.
                                    signer.outputFile = path.join(APP_ROOT, "src/public/documents", outputFile);

                                    // Perform the signature.
                                    return await signer.sign(true)
                                        .then(async () => {
                                            var filePath = 'src/public/documents/' // Obtener la ruta del archivo

                                            var xml_signed = fs.readFileSync(filePath + outputFile, { encoding: 'utf8', flag: 'r' });

                                            if (controlSignRH.length > 0) {
                                                if (xmls[0].signature_rrhh === false) {
                                                    var pos1 = xml_signed.indexOf("<Signature");
                                                    var pos2 = xml_signed.indexOf("</Signature>");
                                                    var valor1 = xml_signed.substring(pos1, pos2 + 12);
                                                    var xml_format = xml_signed.replace(valor1, '<SignatureRRHH>' + valor1 + '</SignatureRRHH>')
                                                } else if (xmls[0].signature_director === false) {
                                                    var pos1 = xml_signed.indexOf("</SignatureRRHH>");
                                                    var pos2 = xml_signed.indexOf("</dRS>");
                                                    var valor1 = xml_signed.substring(pos1 + 16, pos2);
                                                    var xml_format = xml_signed.replace(valor1, '<SignatureDIRECTOR>' + valor1 + '</SignatureDIRECTOR>')
                                                } else if (xmls[0].signature_employee === false) {
                                                    var pos1 = xml_signed.indexOf("</SignatureDIRECTOR>");
                                                    var pos2 = xml_signed.indexOf("</dRS>");
                                                    var valor1 = xml_signed.substring(pos1 + 20, pos2);
                                                    var xml_format = xml_signed.replace(valor1, '<SignatureEMPLEADO>' + valor1 + '</SignatureEMPLEADO>')
                                                }
                                            } else {
                                                if (xmls[0].signature_director === false) {
                                                    var pos1 = xml_signed.indexOf("<Signature");
                                                    var pos2 = xml_signed.indexOf("</Signature>");
                                                    var valor1 = xml_signed.substring(pos1, pos2 + 12);
                                                    var xml_format = xml_signed.replace(valor1, '<SignatureRRHH></SignatureRRHH><SignatureDIRECTOR>' + valor1 + '</SignatureDIRECTOR>')
                                                } else if (xmls[0].signature_employee === false) {
                                                    var pos1 = xml_signed.indexOf("</SignatureDIRECTOR>");
                                                    var pos2 = xml_signed.indexOf("</dRS>");
                                                    var valor1 = xml_signed.substring(pos1 + 20, pos2);
                                                    var xml_format = xml_signed.replace(valor1, '<SignatureEMPLEADO>' + valor1 + '</SignatureEMPLEADO>')
                                                }
                                            }

                                            return db.pg.update({
                                                xml: xml_format
                                            }).table("xml")
                                                .where("id", xml_id)
                                                .returning("id")
                                                .then(async xmls => {

                                                    fs.unlink(filePath + outputFile, (err) => {
                                                        if (err) throw err;
                                                        console.log('file deleted');
                                                    });
                                                    //ATUALIZA O STATUS DA ASSINATURA DO XML DE ACORDO COM O PERFIL DE USUÁRIO
                                                    var updateXmlSignature = await UpdateXmlSignature(xmls[0], signatureType, employee);
                                                    if (!updateXmlSignature) {
                                                        return res.status(200).json({
                                                            status: "error",
                                                            data: "Error al actualizar la firma en XML"
                                                        });
                                                    }
                                                    //BUSCA O DOCUMENTO DO XML
                                                    var document = await GetDocument(xmls[0]);
                                                    //ATUALIZA O STATUS DO XML
                                                    var updateXmlStatus = await UpdateXmlStatus(xmls[0], document);
                                                    if (!updateXmlStatus) {
                                                        return res.status(200).json({
                                                            status: "error",
                                                            data: "Error al actualizar el estado XML"
                                                        });
                                                    } else {
                                                        UpdateDocumentStatus(document.id)
                                                    }

                                                    await db.pg('signature_sessions').where('session_id', 'like', sessionId).del()

                                                    return res.status(200).json({
                                                        status: "success",
                                                        data: "Documento firmado exitosamente"
                                                    });

                                                })
                                        }).catch((err) => console.log(err));

                                } else {
                                    console.log("no se encontro el xml")
                                }
                            })
                    }

                }
            });
    } catch (error) {
        console.log(error)

        return res.status(200).json({
            status: "error",
            data: "Ocurrió un error, contácte con el administrador"
        });
    }
});

router.get('/:id/rejections', async (req, res, next) => {
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

router.post('/:id/rejections', async (req, res, next) => {
    const user = await db.pg('usuario').select('id').where('email', req.body.user_email)

    let data = 'Rechazo firma ' + req.body.user_email;
    utils.insertLogs(req.body.user_email, data);

    const recepients = await db.pg('usuario').select('email')
        .whereIn('profile_id', function () { return this.select('id').from('user_profile').whereIn('profile_slug', ['rh', 'rh_not_signer']) })
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

router.post("/sign-notifcation", async (req, res, next) => {
    var key = db.pg.select('ruc', 'razon_social').table('company').then(async function (values) {
        var key = values[0]['ruc'] + values[0]['razon_social'];
        value = req.body.pin;
        var pass = aes256.decrypt(key, value);
        pass = await passResult(pass);
        let sign = {
            ruc_ci: process.env.SIGN_USER,
            password: process.env.SIGN_PASS
        }
        axios.post(process.env.SIGN_HOST + 'login', sign).then(async (result) => {
            let config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + result.data.token,
                    'Accept': 'application/json'
                }
            };
            //Buscamos la notificacion
            let notifica = await db.pg
                .table("xml_notificaciones")
                .where('xml_notificaciones.id', req.body.id)
                .select('id', 'employee_id', 'pdf_document') //db.pg.raw(`encode(xml_notificaciones.pdf_document, \'base64\') as pdf`
                .then((result) => {
                    if (result.length === 0) {
                        return result;
                    } else {
                        return result[0];
                    }
                }).catch((e) => {
                    console.log(e);
                })
            //Buscamos la compañia para establecer la ruta
            let company = await db.pg
                .table('company')
                .select('ruc')
                .then((result) => {
                    return result[0].ruc;
                }).catch((e) => {
                    console.log(e);
                })
            let user = await db.pg
                .table('employee')
                .select('identification', 'apellidos', 'nombres')
                .where('id', notifica.employee_id)
                .then((result) => {
                    return result[0];
                }).catch((e) => {
                    console.log(e);
                })
            //Leemos el pfx
            let cert = await ReadFile(company, user.identification);
            //Tranformamos el PDF
            let fileContent = '';
            let buff = new Buffer(notifica.pdf_document);
            fileContent = buff.toString('base64');
            let docPdf = fileContent;
            let data = {
                document_ext: "pdf",
                cert_ext: "pfx",
                pin: pass,
                visible: false,
                cert: cert,
                document: docPdf
            }
            axios.post(
                process.env.SIGN_HOST + 'receive_document',
                data,
                config
            )
                .then(async (response) => {
                    console.log(response)
                    if (response.data.status == 'success') {
                        let docPdf = response.data.document;
                        let buff = new Buffer(docPdf, 'base64');
                        docPdf = buff.toString('binary');
                        fs.writeFileSync("1.pdf", docPdf, 'binary');
                        docPdf = await ReadPDF('1.pdf');
                        db.pg.update({
                            signature_employee: true,
                            signature_employee_datetime: db.pg.fn.now(),
                            signature_employee_name: user.apellidos + ' ' + user.nombres,
                            pdf_document: docPdf
                        }).table('xml_notificaciones')
                            .where('id', req.body.id)
                            .then((result) => {
                                fs.unlinkSync('1.pdf');
                                return res.status(200).send({
                                    status: 'success',
                                    resultSignature: result,
                                    data: 'Firmado con exito'
                                });
                            })
                            .catch((e) => {
                                console.log("error1");
                                return res.status(400).send({
                                    status: 'error',
                                    resultSignature: false,
                                    data: 'Problemas con la firma del presente documento'
                                });
                            });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    console.log("error2");
                    return res.status(400).send({
                        status: 'error',
                        resultSignature: false,
                        data: 'Problemas con la firma del presente documento'
                    });
                });
        }).catch(function (err) {
            console.log(err);
            console.log("error3");
            return res.status(400).send({
                status: 'error',
                resultSignature: false,
                data: 'Problemas con la firma del presente documento'
            });
        });
    })
    //req.body.id 
})

async function ReadPDF(file) {
    /* const promise = await new Promise((resolve, reject) => {
        fs.readFile(file.file.path, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data.toString());
        });
    });
    return promise; */
    return fs.readFileSync(file);
}

async function ReadFile(company, user) {
    const promise = await new Promise((resolve, reject) => {
        fs.readFile(`./openssl/certificates/empresa-${company}/ci-${user}/certificate.pfx`, (err, data) => {
            if (err) {
                reject(err);
            } else {
                let buff = new Buffer(data);
                let result = buff.toString('base64');
                resolve(result);
            }
        });
    });
    return promise;
}

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
    //GET XML DETAILS
    var xmlDetails = await GetXMLDetails(xmlObj.id);
    var hash_kude = "01" + moment(xmlObj.fecha_de_pago).format("DDMMYYYY") + moment().format("DDMMYYYYHHmm") + employee.mtess_patronal + employee.identification;

    await SaveHashKude(xmlObj.id, hash_kude);

    if (employee.fecha_ingresso) {
        var fecha_ingreso = moment(employee.fecha_ingresso).format('DD/MM/YYYY');
    } else {
        var fecha_ingreso = '01/01/2018';
    }

    try {

        var xml =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<dRS xmlns="http://firma.mtess.gov.py/xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://firma.mtess.gov.py/xsd">' +
            '<dVerFor>008</dVerFor>' +
            "<hashKude>" + hash_kude + "</hashKude>" +
            "<RS>" +
            "<encabezado>" +
            "<llave>" + patronal.hash + "</llave>" +
            "<razonSocial>" + company.razon_social + "</razonSocial>" +
            "<ruc>" + company.ruc + "</ruc>" +
            "<dv>" + company.dv + "</dv>" +
            "<nroMTESSPatronal>" + employee.mtess_patronal + "</nroMTESSPatronal>" +
            // "<legajo>1</legajo>" +
            "<apellidos>" + employee.apellidos + "</apellidos>" +
            "<nombres>" + employee.nombres + "</nombres>" +
            "<sueldoJornal>" + xmlObj.salario_mensual + "</sueldoJornal>" +
            "<nroIPSEmpleado>" + employee.ips_empleado + "</nroIPSEmpleado>" +
            "<cINro>" + employee.identification + "</cINro>" +
            "<fechaIngreso>" + fecha_ingreso + "</fechaIngreso>" +
            "<mesDePago>" + moment(xmlObj.mes_de_pago).format('YYYY-MM-DD') + "</mesDePago>" +
            "<fechaDeCreacion>" + moment(new Date()).format('YYYY-MM-DD HH:mm') + "</fechaDeCreacion>" +
            "</encabezado>" +
            "<detalles>" + xmlDetails + "</detalles>" +
            "<pie>" +
            "<totalIngresos>" + xmlObj.total_ingresos + "</totalIngresos>" +
            "<totalRetenciones>" + xmlObj.total_retenciones + "</totalRetenciones>" +
            "<totalNeto>" + xmlObj.total_neto + "</totalNeto>" +
            "<netoEnLetras>" + xmlObj.neto_en_letras + "</netoEnLetras>" +
            "<fechaDePago>" + moment(xmlObj.fecha_de_pago).format('YYYY-MM-DD') + "</fechaDePago>" +
            "</pie>" +
            "</RS>" +
            "</dRS>";

        return xml;
    } catch (error) {
        console.log(error);
        return "";
    }
}


async function GetXMLF1(xmlObj) {
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

    if (employee.fecha_ingresso) {
        var fecha_ingreso = moment(employee.fecha_ingresso).format('DD/MM/YYYY');
    } else {
        var fecha_ingreso = '01/01/2018';
    }

    try {

        var xml =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<dRS xmlns="http://firma.mtess.gov.py/xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://firma.mtess.gov.py/xsd siRecepDE_v150.xsd">' +
            '<dVerFor>008</dVerFor>' +
            "<hashKude>" + hash_kude + "</hashKude>" +
            "<RS>" +
            "<encabezado>" +
            "<llave>" + patronal.hash + "</llave>" +
            "<razonSocial>" + company.razon_social + "</razonSocial>" +
            "<ruc>" + company.ruc + "</ruc>" +
            "<dv>" + company.dv + "</dv>" +
            "<nroIPSPatronal>" + employee.mtess_patronal + "</nroIPSPatronal>" +
            // "<legajo>1</legajo>" +
            "<apellidos>" + employee.apellidos + "</apellidos>" +
            "<nombres>" + employee.nombres + "</nombres>" +
            "<sueldoJornal>" + employee.sueldo_jornal + "</sueldoJornal>" +
            "<nroIPSEmpleado>" + employee.ips_empleado + "</nroIPSEmpleado>" +
            "<cINro>" + employee.identification + "</cINro>" +
            "<fechaIngreso>" + fecha_ingreso + "</fechaIngreso>" +
            "<mesDePago>" + moment(xmlObj.mes_de_pago).format('YYYY-MM-DD') + "</mesDePago>" +
            "<fechaDeCreacion>" + moment(new Date()).format('YYYY-MM-DD HH:mm') + "</fechaDeCreacion>" +
            "</encabezado>" +
            "<detalles>" + xmlDetails + "</detalles>" +
            "<pie>" +
            "<totalIngresos>" + xmlObj.total_ingresos + "</totalIngresos>" +
            "<totalRetenciones>" + xmlObj.total_retenciones + "</totalRetenciones>" +
            "<totalNeto>" + xmlObj.total_neto + "</totalNeto>" +
            "<netoEnLetras>" + xmlObj.neto_en_letras + "</netoEnLetras>" +
            "<fechaDePago>" + moment(xmlObj.fecha_de_pago).format('YYYY-MM-DD') + "</fechaDePago>" +
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
        .table('xml_details')
        .where('xml_id', xmlId)
        .then(detailsList => {
            var resultDetails = detailsList.map(details => {
                return "<detalle_item>" +
                    "<codigo>" + details.codigo + "</codigo>" +
                    "<descripcion>" + details.descripcion + "</descripcion>" +
                    "<cant>" + details.cant + "</cant>" +
                    "<ingresos>" + (details.ingresos != 0 ? details.ingresos : details.ingresosno) + "</ingresos>" +
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
    var result = await db.pg.update({
        signature_director: 1,
        signature_director_datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
        signature_director_name: employee.nombres + " " + employee.apellidos,
        signature_director_holograph: employee.firma_holografa,
    })
        .table("xml")
        .where("id", id)
        .where("signature_director", false)
        .then(() => {
            return true;
        })
        .catch(e => {
            return false;
        });
    return result;
}

async function UpdateRRHHXmlSignature(id, employee) {
    console.log("EMPLOYEE RRHH: " + employee);
    var result = await db.pg.update({
        signature_rrhh: 1,
        signature_rrhh_datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
        signature_rrhh_name: employee.nombres + " " + employee.apellidos,
        signature_rrhh_holograph: employee.firma_holografa,
    })
        .table("xml")
        .where("id", id)
        .then(() => {
            return true;
        })
        .catch(e => {
            console.log('Error updating rrhh signature: ', e)
            return false;
        });
    return result;
}

async function UpdateEmpleadoXmlSignature(id, employee) {
    var result = await db.pg.update({
        signature_employee: 1,
        signature_employee_datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
        signature_employee_name: employee.nombres + " " + employee.apellidos,
        signature_employee_holograph: employee.firma_holografa,
    })
        .table("xml")
        .where("id", id)
        .then(() => {
            return true;
        })
        .catch(e => {
            console.log("ERRO: " + e);
            return false;
        });
    return result;
}

async function VerifyXmlSignature(xmlId, signatureType) {
    return db.pg.select('*')
        .table('xml')
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

async function UpdateXmlStatus(id, document) {
    const controlSign = await db.pg('type_sign')
        .innerJoin('control_sign', 'sign_type', '=', 'type_sign.id')
        .select('sign_name')
        .then((result) => {
            return result;
        });
    let RRHH = false;
    for (let i = 0; i < controlSign.length; i++) {
        if (controlSign[i].sign_name === 'RH') {
            RRHH = true;
        }
    }
    return db.pg.select("*")
        .table('xml')
        .where('id', id)
        .then(xmls => {
            let status = 'PEN';

            if (RRHH == true) {
                //VERIFICA SE PELO MENOS UMA ASSINATURA FOI FEITA
                if (xmls[0].signature_director || xmls[0].signature_rrhh || xmls[0].signature_employee) {
                    status = 'ENP';
                }

                //VERIFICA SE TODAS AS ASSINATURAS JÁ FORAM FEITAS
                if (xmls[0].signature_director && xmls[0].signature_rrhh && xmls[0].signature_employee) {
                    status = 'COM';
                }

                //VERIFICA SE ESTÁ COMPLETO TARDIO
                if (xmls[0].signature_director && xmls[0].signature_rrhh && xmls[0].signature_employee && moment(document.end_date).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
                    status = 'TAR';
                }
            } else {
                //VERIFICA SE PELO MENOS UMA ASSINATURA FOI FEITA
                if (xmls[0].signature_director || xmls[0].signature_employee) {
                    status = 'ENP';
                }

                //VERIFICA SE TODAS AS ASSINATURAS JÁ FORAM FEITAS
                if (xmls[0].signature_director && xmls[0].signature_employee) {
                    status = 'COM';
                }

                //VERIFICA SE ESTÁ COMPLETO TARDIO
                if (xmls[0].signature_director && xmls[0].signature_employee && moment(document.end_date).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
                    status = 'TAR';
                }
            }
            console.log('updating xml');
            return db.pg.update({
                status: status
            })
                .table("xml")
                .where("id", id)
                .then(async () => {
                    return true;
                })
        })
        .catch(err => {
            return { status: 'error', message: "Error al actualizar el estado XML: " + err };
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
        .join('xml', 'xml.document_id', 'document.id')
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
        .table('xml')
        .update({
            hash_kude: hashKude
        })
        .then(() => {

        })
        .catch(e => {

        });
}

router.post("/signall", async function (req, res, next) {

    var documentId = req.body.document_id
    var code = req.body.code;
    var state = req.body.state;
    var sessionId = req.body.session_id
    var user_email = req.body.user_email;
    var user_profile = req.body.user_profile;
    var control = await db.pg.table('control')
    var controlSignRH = await db.pg('control_sign').where('sign_type', '3')
    var empresa = await db.pg.table('company')
    var key = empresa[0].ruc + empresa[0].razon_social;
    var email = aes256.decrypt(key, user_email);
    var perfil = aes256.decrypt(key, user_profile);
    if (req.body.pin) {
        var pin = aes256.decrypt(key, req.body.pin);
        var pass = await utils.replaceChar(pin);
    } else {
        var pin = ''
        var pass = await utils.replaceChar(pin);
    }

    try {
        //busca a empresa
        let mes_de_pago = "";

        await db.pg.select("*")
            .table("xml")
            .where("document_id", documentId)
            .then(async xml => {
                mes_de_pago = xml[0].mes_de_pago
            })

        var fechaPago = moment(mes_de_pago).format()
        var fecha = moment(fechaPago.toString().split("T")[0]).add(1, 'days')
        let data = 'Firma masiva de recibos mes: ' + moment(fecha.toString().split("Moment")[0]).format("DD/MM/YYYY");
        utils.insertLogs(email, data, 'Firma Apoderado', 'INFO');

        return db.pg.select("*")
            .table("company")
            .then(async companies => {
                //BUSCA O EMPREGADO
                var employee = await GetEmployeeByEmail(email);

                //AJUSTA O PATH DE ACORDO COM O CI
                var path_cert = "empresa-" + companies[0].ruc + "/ci-" + employee.identification;

                //BUSCA O USUÁRIO DO EMPREGADO PARA DESCOBRIR O TIPO
                var signatureType = await GetSignatureType(employee.email, perfil);


                if (signatureType === false) {
                    let data = 'Firma masiva de recibos: Perfil de usuario no válido';
                    utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                    return res.status(200).json({
                        status: "error",
                        data: "Perfil de usuario no válido"
                    });
                }

                if (employee.cert_type === 'F1') {
                    //COMANDOS
                    var comandoPrivate = `openssl pkcs12 -in certificates/${path_cert}/certificate.pfx -out certificates/${path_cert}/private.pem -passin pass:${pass} -nodes`;
                    var comandoPublic = `openssl pkcs12 -in openssl/certificates/${path_cert}/certificate.pfx -clcerts -nokeys -passin pass:${pass} | awk '/BEGIN/ { i++; } /BEGIN/, /END/ { print > "openssl/certificates/${path_cert}/public.pem" }'`;
                    let dates = await utils.verifyCertDate(`openssl/certificates/${path_cert}/certificate.pfx`, pass);

                    if (dates) {
                        if (dates.stderr) {
                            if (dates.stderr.indexOf('pass') > 0) {
                                let data = 'El pin suministrado no corresponde al certificado';
                                utils.insertLogs(email, data, 'Firma funcionario', 'WARNING');
                                return res.status(200).json({
                                    status: "error",
                                    data: "El pin suministrado no corresponde al certificado"
                                });
                            } else {
                                let errMsg = ''
                                if (dates.stderr.indexOf('No such file or directory') != -1) {
                                    let data = 'El certificado aún no fue importado';
                                    utils.insertLogs(email, data, 'Firma funcionario', 'WARNING');
                                    errMsg = 'Atención, El certificado aún no fue importado!'
                                } else {
                                    errMsg = dates.stderr;
                                }

                                console.log(dates.stderr)
                                return res.status(200).json({
                                    status: "error",
                                    data: errMsg
                                });
                            }
                        } else {
                            dates = dates.split('\n');
                            dateEnd = moment(dates[0].substring(10, dates[0].length)).format('YYYY-MM-DD');
                            dateStart = moment(dates[1].substring(9, dates[0].length)).format('YYYY-MM-DD');
                            console.log("cert_start=" + dateEnd + "cert_end=" + dateStart);
                        }
                    } else {
                        return res.status(200).json({
                            status: "error",
                            data: "Error en la verificación del certificado, el mismo no existe o el pin es erroneo"
                        });
                    }

                    await db.pg.update({ cert_start: dateEnd, cert_end: dateStart }).table('employee').where('identification', employee.identification);
                    if (!moment().isAfter(dateStart)) {
                        return openssl(comandoPrivate, (err, buffer) => {
                            if (err.toString() === "") {
                                //CONVERTE CHAVE PÚBLICA
                                //openssl(comandoPublic, (err, buffer) => {
                                return exec(comandoPublic, async (err, stdout, stderr) => {
                                    if (!err) {
                                        //BUSCA XML NO BD OU MONTA XML CASO NÃO EXISTA AINDA
                                        return db.pg.select("*")
                                            .table("xml")
                                            .where("document_id", documentId)
                                            .then(async xmls => {
                                                Promise.all(xmls.map(async xml_record => {

                                                    var xml = xml_record.xml;

                                                    if (xml === null) {
                                                        //CRIA O XML
                                                        xml = await GetXML(xml_record);
                                                    }

                                                    //VERIFICA SE ESSE XML JÁ FOI ASSINADO PELO PERFIL QUE ESTÁ TENTANDO ASSINAR TODOS
                                                    //var responseVerify = await VerifyXmlSignature(xml_record.id, signatureType);

                                                    /*if (responseVerify.status === 'signed') {
                                                        return res.status(200).json({
                                                            status: "error",
                                                            data: "No es posible firmar por lotes en este momento. Es posible que algunos documentos ya estén firmados. Firma individualmente."
                                                        });
                                                    } else 
                                                    if (responseVerify.status === 'error') {
                                                        return res.status(200).json({
                                                            status: "error",
                                                            data: "Error al verificar la firma en XML."
                                                        });
                                                    } else {*/
                                                    //ASSINA
                                                    var sig = new SignedXml();
                                                    var publicKey = fs.readFileSync(`./openssl/certificates/${path_cert}/public.pem`);
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
                                                    sig.signingKey = fs.readFileSync(`./openssl/certificates/${path_cert}/private.pem`);
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
                                                        .table("xml")
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

                                                            //BUSCA O DOCUMENTO DO XML
                                                            var document = await GetDocument(xmls[0].id);

                                                            //ATUALIZA O STATUS DO XML
                                                            var updateXmlStatus = await UpdateXmlStatus(xmls[0].id, document);
                                                            if (!updateXmlStatus) {
                                                                return res.status(200).json({
                                                                    status: "error",
                                                                    data: "Error al actualizar el estado en XML"
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
                                                    //}
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
                                    //});
                                });
                            } else {
                                const errStr = err.toString()
                                console.log('Cert. sign error: ', errStr)
                                let errMsg = ''
                                if (errStr.indexOf('Mac verify error: invalid password?') != -1) {
                                    let data = 'Firma masiva de recibos: El pin suministrado no corresponde al certificado';
                                    utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                                    errMsg = 'El pin suministrado no corresponde al certificado'
                                } else if (errStr.indexOf('No such file or directory') != -1) {
                                    let data = 'Firma masiva de recibos: el certificado aún no fue importado';
                                    utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                                    errMsg = 'Atención, el certificado aún no fue importado!'
                                } else {
                                    errMsg = err
                                }
                                return res.status(200).json({
                                    status: "error",
                                    data: errMsg
                                });
                            }
                        });
                    } else {
                        let data = 'Certificado vencido:' + dateStart;
                        utils.insertLogs(email, data, 'Firma Apoderado', 'WARNING');
                        return res.status(200).json({
                            status: "error",
                            data: 'Certificado vencido, comuniquese con el emisor'
                        });
                    }
                    //CONVERTE CHAVE PRIVADA

                } else if (employee.cert_type === 'F3') {
                    const manager = new TrustServicesManager();
                    Util.setPkiDefaults(manager);

                    // Complete the authentication process, recovering the
                    // session info to be used on the signature and the
                    // custom state (fileId).
                    const result = await manager.completeAuth(code, state);

                    const explorer = new CertificateExplorer();
                    explorer.trustServiceSession = result.session;
                    const openResult = await explorer.open();

                    if (control[0].produccion) {
                        if (employee.identification.trim() != openResult._certificate._pkiParaguay._ci.trim()) {
                            let data = 'La informacion de sesion no coincide con el certificado: ' + employee.email + "/" + openResult._certificate._pkiParaguay._ci;
                            utils.insertLogs(email, data, 'Firma ' + perfil, 'WARNING');
                            return res.status(200).json({
                                status: "error",
                                data: "Atención, la información de sesión no coincide con el certificado"
                            })
                        }
                    }

                    var fecha_emision = openResult._certificate._validityStart
                    var fecha_vencimiento = openResult._certificate._validityEnd

                    await db.pg.table('employee')
                        .update({
                            cert_start: moment(fecha_emision).format('YYYY-MM-DD HH:mm:ss'),
                            cert_end: moment(fecha_vencimiento).format('YYYY-MM-DD HH:mm:ss'),
                        }).where('id', employee.id)

                    if (moment().isAfter(fecha_vencimiento)) {
                        let data = 'El certificado ha expirado: ' + employee.email + "/" + fecha_vencimiento;
                        utils.insertLogs(email, data, 'Firma ' + perfil, 'WARNING');
                        return res.status(200).json({
                            status: "error",
                            data: "Atención, el certificado ha expirado"
                        })
                    } else {
                        // Get an instance of the XmlSigner class, responsible for receiving
                        // the signature elements and performing the local signature. And
                        // setting common configuration with setPkiDefaults (see util.js)
                        const signer = new XmlSigner();

                        Util.setPkiDefaults(signer);

                        // Set signature policy
                        signer.signaturePolicy = StandardSignaturePolicies.XML_DSIG_BASIC;

                        return db.pg.select("*")
                            .table("xml")
                            .where("document_id", documentId)
                            .then(async xmls => {
                                Promise.all(xmls.map(async xml_record => {

                                    var responseVerify = await VerifyXmlSignature(xml_record.id, signatureType);

                                    if (responseVerify.status === 'signed') {
                                        console.log("Recibo ya firmado")
                                    } else {

                                        var xml = xml_record.xml;

                                        if (xml === null) {
                                            xml = await GetXML(xml_record);
                                        }

                                        fs.writeFileSync('src/public/documents/' + xml_record.id + '.xml', xml);

                                        if (fs.existsSync('src/public/documents/' + xml_record.id + '.xml')) {
                                            await signer.setXmlToSignFromPath(path.join(APP_ROOT, 'src/public/documents/', xml_record.id + '.xml'));
                                            /*generar el archivo en disco para que pueda leerlo*/
                                            // Set trust session acquired on the following steps of this sample.
                                            signer.trustServiceSession = result.session;
                                            // Generate path for output file and add the signature finisher.
                                            //const outputFile = xml_record.id+'.xml';
                                            var outputFile = xml_record.id + '.xml';
                                            signer.outputFile = path.join(APP_ROOT, "src/public/documents", outputFile);

                                            // Perform the signature.
                                            return await signer.sign(true)
                                                .then(async () => {
                                                    var filePath = 'src/public/documents/' // Obtener la ruta del archivo

                                                    var xml_signed = fs.readFileSync(filePath + outputFile, { encoding: 'utf8', flag: 'r' });

                                                    if (controlSignRH.length > 0) {
                                                        if (xml_record.signature_rrhh === false) {
                                                            var pos1 = xml_signed.indexOf("<Signature");
                                                            var pos2 = xml_signed.indexOf("</Signature>");
                                                            var valor1 = xml_signed.substring(pos1, pos2 + 12);
                                                            var xml_format = xml_signed.replace(valor1, '<SignatureRRHH>' + valor1 + '</SignatureRRHH>')
                                                        } else if (xml_record.signature_director === false) {
                                                            var pos1 = xml_signed.indexOf("</SignatureRRHH>");
                                                            var pos2 = xml_signed.indexOf("</dRS>");
                                                            var valor1 = xml_signed.substring(pos1 + 16, pos2);
                                                            var xml_format = xml_signed.replace(valor1, '<SignatureDIRECTOR>' + valor1 + '</SignatureDIRECTOR>')
                                                        } else if (xml_record.signature_employee === false) {
                                                            var pos1 = xml_signed.indexOf("</SignatureDIRECTOR>");
                                                            var pos2 = xml_signed.indexOf("</dRS>");
                                                            var valor1 = xml_signed.substring(pos1 + 20, pos2);
                                                            var xml_format = xml_signed.replace(valor1, '<SignatureEMPLEADO>' + valor1 + '</SignatureEMPLEADO>')
                                                        }
                                                    } else {
                                                        if (xml_record.signature_director === false) {
                                                            var pos1 = xml_signed.indexOf("<Signature");
                                                            var pos2 = xml_signed.indexOf("</Signature>");
                                                            var valor1 = xml_signed.substring(pos1, pos2 + 12);
                                                            var xml_format = xml_signed.replace(valor1, '<SignatureRRHH></SignatureRRHH><SignatureDIRECTOR>' + valor1 + '</SignatureDIRECTOR>')
                                                        } else if (xml_record.signature_employee === false) {
                                                            var pos1 = xml_signed.indexOf("</SignatureDIRECTOR>");
                                                            var pos2 = xml_signed.indexOf("</dRS>");
                                                            var valor1 = xml_signed.substring(pos1 + 20, pos2);
                                                            var xml_format = xml_signed.replace(valor1, '<SignatureEMPLEADO>' + valor1 + '</SignatureEMPLEADO>')
                                                        }
                                                    }

                                                    return db.pg.update({
                                                        xml: xml_format
                                                    }).table("xml")
                                                        .where("id", xml_record.id)
                                                        .returning("id")
                                                        .then(async xmls => {

                                                            fs.unlink(filePath + outputFile, (err) => {
                                                                if (err) throw err;
                                                                console.log('file deleted');
                                                            });

                                                            //ATUALIZA O STATUS DA ASSINATURA DO XML DE ACORDO COM O PERFIL DE USUÁRIO
                                                            var updateXmlSignature = await UpdateXmlSignature(xmls[0], signatureType, employee);
                                                            if (!updateXmlSignature) {
                                                                return res.status(200).json({
                                                                    status: "error",
                                                                    data: "Error al actualizar la firma en XML"
                                                                });
                                                            }
                                                            //BUSCA O DOCUMENTO DO XML
                                                            var document = await GetDocument(xmls[0]);
                                                            //ATUALIZA O STATUS DO XML
                                                            var updateXmlStatus = await UpdateXmlStatus(xmls[0], document);
                                                            if (!updateXmlStatus) {
                                                                return res.status(200).json({
                                                                    status: "error",
                                                                    data: "Error al actualizar el estado XML"
                                                                });
                                                            } else {
                                                                UpdateDocumentStatus(document.id)
                                                            }

                                                            await db.pg('signature_sessions').where('session_id', 'like', sessionId).del()

                                                        })
                                                }).catch((err) => console.log(err));

                                        } else {
                                            console.log("no se encontro el xml")
                                        }

                                    }

                                })).then(() => {
                                    return res.status(200).json({
                                        status: "success",
                                        data: "Documentos firmados exitosamente"
                                    });
                                });

                            })
                    }
                }
            });
    } catch (error) {
        return res.status(200).json({
            status: "error",
            data: "Error general: " + error
        });
    }
});

async function passResult(pass) {
    return await utils.replaceChar(pass);
}

router.post('/:id/deactivate', (req, res, next) => {
    let data = 'Desactivacion Firma ' + req.body.creator;
    utils.insertLogs(req.body.creator, data);
    db.pg.update({
        status: 'DES',
        motivo_desactivacion: req.body.motivo_desactivacion,
    })
        .table('xml')
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