const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db/db');
const nodemailer = require("nodemailer");
require("dotenv-safe").load();
const Email = require('email-templates');
const path = require('path');
var moment = require("moment");
var crypto = require('crypto');
const axios = require('axios');
const { DatabaseError } = require('pg');
const FormData = require('form-data');
const exec = require('await-exec');
var aes256 = require('aes256');

module.exports = {

    validateEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    emailExists: async function (email, table, id = null) {
        return db.pg.select('*').table(table).where('email', email).where('id', '<>', id).then(function (users) {
            if (users.length === 1) {
                return true;
            } else {
                return false;
            }
        });
    },

    verifyJWT: function (req, res, next) {
        var token = req.headers.authorization.split(' ');
        console.log("token de sesion capturado: " + token[1])
        if (!token) return res.status(415).send({ auth: false, message: 'No token provided.' });
        jwt.verify(token[1], process.env.SECRET, function (err, decoded) {
            if (err) return res.status(415).send({ auth: false, message: 'Failed to authenticate token: ' + err });
            return next(decoded.id, decoded.perfil, token[1]);
        });
    },

    cryptPassword: function (password, callback) {
        return bcrypt.genSalt(10, function (err, salt) {
            if (err)
                throw callback(err);

            return bcrypt.hash(password, salt, function (err, hash) {
                return callback(err, hash);
            });
        });
    },

    cryptPasswordSync: function (password) {
        var salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    },

    comparePassword: function (plainPass, hashword, callback) {
        bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
            return err == null ? callback(null, isPasswordMatch) : callback(err);
        });
    },

    sum: function (a, b) {
        return a + b;
    },

    emailSetup: function () {
        var email_password = aes256.decrypt('itau', process.env.EMAIL_PASSWORD);
        // create reusable transporter object using the default SMTP transport

        /*let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SMTP,
            port: process.env.EMAIL_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: email_password
            },
            tls: {
                //     // do not fail on invalid certs
                rejectUnauthorized: false
            },
        });*/

        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SMTP,
            secureConnection: false, // TLS requires secureConnection to be false
            port: process.env.EMAIL_PORT, // port for secure SMTP
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            },
            auth: {
                user: process.env.EMAIL_USER,
                pass: email_password
            }
        });

        return transporter;
    },

    // sendEmail:async function(email){
    //     let transporter = this.emailSetup();

    //     // send mail with defined transport object
    //     let info = await transporter.sendMail({
    //       from: `"${email.senderName}" <${email.senderEmail}>`,
    //       to: email.to, //array
    //       subject: email.subject,
    //       text: email.plainText,
    //       html: email.html
    //     });
    // },

    sendMail: async function (data) {
        if (!data) {
            data = {}
        }

        var email_password = aes256.decrypt('itau', process.env.EMAIL_PASSWORD);

        data.smtp_host = process.env.EMAIL_SMTP
        data.smtp_from_name = process.env.EMAIL_USER
        data.smtp_username = process.env.EMAIL_USER
        data.smtp_password = email_password
        data.smtp_port = process.env.EMAIL_PORT
        data.smtp_encryption = process.env.EMAIL_PORT == 465 ? 'ssl' : 'tls'
        data.smtp_from_address = process.env.EMAIL_USER

        //console.log("enviando correo a: " + data.to);
        //return await axios.post('http://' + process.env.EMAIL_HOST + '/api/email/send', data)

        if (data.template) {
            const email = new Email({
                message: {
                    from: data.from
                },
                // uncomment below to send emails in development/test env:
                send: true,
                transport: {
                    jsonTransport: true
                },
                transport: this.emailSetup()
            });

            let emailConfig = {
                //views: { root: path.join },
                message: {
                    to: data.to,
                    subject: data.subject
                },
                locals: {
                    name: data.toName,
                    password: data.password,
                }
            }

            if (data.template) {
                emailConfig.message.template = path.join(__dirname, 'emails', data.template)
            }

            if (data.html) {
                emailConfig.message.html = data.html
            }

            return email
                .send(emailConfig)
                .then((ok) => {
                    console.log(ok);
                    console.log("enviando tipo correo1 a: " + data.to);
                    let response = { status: 'success', message: 'Correo electrónico enviado' };
                    return response;
                })
                .catch((err) => {
                    console.log("no se pudo enviar el tipo correo1 a: " + data.to);
                    console.log('EMAIL ERR: ', err);
                    let response = { status: 'error', message: err }
                    return response;
                });
        }
        if (data.html) {
            return this.emailSetup()
                .sendMail({
                    from: process.env.EMAIL_USER,
                    to: data.to,
                    subject: data.subject,
                    html: data.html
                })
                .then((ok) => {
                    console.log(ok);
                    console.log("enviando tipo correo2 a: " + data.to);
                    let response = { status: 'success', message: 'Correo electrónico enviado' };
                    return response;
                })
                .catch((err) => {
                    console.log("no se pudo enviar el tipo correo2 a: " + data.to);
                    console.log('EMAIL ERR: ', err);
                    let response = { status: 'error', message: err }
                    return response;
                });
        }
        return new Promise((resolve, reject) => resolve(false))

    },

    sendNotificacion: async function (data) {
        if (!data) {
            data = {}
        }

        if (data.template) {
            const email = new Email({
                message: {
                    from: data.from
                },
                // uncomment below to send emails in development/test env:
                send: true,
                transport: {
                    jsonTransport: true
                },
                transport: this.emailSetup()
            });

            let emailConfig = {
                //views: { root: path.join },
                message: {
                    to: data.to,
                    subject: data.subject
                },
                locals: {
                    name: data.toName
                }
            }

            if (data.template) {
                emailConfig.message.template = path.join(__dirname, 'emails', data.template)
            }

            if (data.html) {
                emailConfig.message.html = data.html
            }

            return email
                .send(emailConfig)
                .then((ok) => {
                    console.log(ok);
                    console.log("enviando tipo correo1 a: " + data.to);
                    let response = { status: 'success', message: 'Correo electrónico enviado' };
                    return response;
                })
                .catch((err) => {
                    console.log("no se pudo enviar el tipo correo1 a: " + data.to);
                    console.log('EMAIL ERR: ', err);
                    let response = { status: 'error', message: err }
                    return response;
                });
        }
        if (data.html) {
            return this.emailSetup()
                .sendMail({
                    from: process.env.EMAIL_USER,
                    to: data.to,
                    subject: data.subject,
                    html: data.html,
                    attachments: [
                        {
                            filename: 'Lista de certificados.xlsx',
                            path: data.attachments
                        }
                    ]
                })
                .then((ok) => {
                    console.log(ok);
                    console.log("enviando correo html a: " + data.to);
                    let response = { status: 'success', message: 'Correo electrónico enviado' };
                    return response;
                })
                .catch((err) => {
                    console.log("no se pudo enviar el correo html a: " + data.to);
                    console.log('EMAIL ERR: ', err);
                    let response = { status: 'error', message: err }
                    return response;
                });
        }
        return new Promise((resolve, reject) => resolve(false))

    },

    sendMailExt: async function (data) {
        const form = new URLSearchParams();
        form.append('usuario', process.env.EMAIL_WS_USER);
        form.append('clave', process.env.EMAIL_WS_PASS);
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        let datos = {};
        if (data.id_plantilla == 3) {
            datos.nombre = data.toName;
        } else {
            datos.nombre = data.toName;
            datos.clave = data.password;
            datos.link = process.env.HOST;
        }

        axios.post(process.env.EMAIL_WS_HOST + 'login', form, config)
            .then(function (response) {
                let config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + response.data.token,
                        'Accept': 'application/json'
                    }
                };
                let body = {
                    "direccion_correo": data.to,
                    "asunto": data.subject,
                    "id_plantilla": data.id_plantilla,
                    datos
                }
                axios.post(
                    process.env.EMAIL_WS_HOST + 'correos/enviar',
                    body,
                    config
                )
                    .then((response) => {
                        console.log(response)
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            })
            .catch(function (error) {
                console.log(error);
            });
    },

    simpleRandomHash: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    aes256encryption: function (stringToEncrypt) {
        var key = '00000000000000000000000000000000'; //replace with your key
        var iv = crypto.randomBytes(16); //replace with your IV

        var cipher = crypto.createCipheriv('aes256', key, iv)
        var crypted = cipher.update(authorizationKey, 'utf8', 'base64')
        crypted += cipher.final('base64');
        console.log(crypted);
    },

    insertLogsMtessDocument: async function (email, data, tipo, categoria) {
        const loggedInUser = await db.pg('usuario').where('email', email)
        try {
            await db.pg('log').insert({
                user_id: loggedInUser[0].id,
                message: data,
                tipo: tipo,
                categoria: categoria,
            });
        } catch (err) {
            await db.pg('log').insert({
                user_id: loggedInUser[0].id,
                message: data + ' ' + email + ' Usuario invalido',
                tipo: tipo,
                categoria: categoria,
            });
        }
    },

    insertLogsMtessXml: async function (email, data, xml, nro_recibo, tipo, categoria) {
        const loggedInUser = await db.pg('usuario').where('email', email)
        try {
            await db.pg('log').insert({
                user_id: loggedInUser[0].id,
                message: data,
                xml_id: xml,
                recibo: nro_recibo,
                tipo: tipo,
                categoria: categoria
            });
        } catch (err) {
            await db.pg('log').insert({
                user_id: loggedInUser[0].id,
                message: data + ' ' + email + ' Usuario invalido',
                tipo: tipo,
                categoria: categoria
            });
        }
    },

    insertLogsWS: async function (email, data, tipo, categoria) {
        const loggedInUser = await db.pg('usuario').where('email', email)
        if (loggedInUser.length > 0) {
            try {
                await db.pg('log').insert({
                    user_id: loggedInUser[0].id,
                    message: data,
                    tipo: tipo,
                    categoria: categoria
                });
            } catch (err) {
                await db.pg('log').insert({
                    user_id: loggedInUser[0].id,
                    message: data + ' ' + email + ' Usuario invalido',
                    tipo: tipo,
                    categoria: categoria
                });
            }
        } else {
            await db.pg('log').insert({
                user_id: null,
                message: data,
                tipo: tipo,
                categoria: categoria
            });

        }

    },

    insertLogs: async function (email, data, tipo, categoria) {
        const loggedInUser = await db.pg('usuario').where('email', email)
        if (loggedInUser.length > 0) {
            try {
                await db.pg('log').insert({
                    user_id: loggedInUser[0].id,
                    message: data,
                    tipo: tipo,
                    categoria: categoria
                });
            } catch (err) {
                await db.pg('log').insert({
                    user_id: loggedInUser[0].id,
                    message: data + ' ' + email + ' Usuario invalido',
                    tipo: tipo,
                    categoria: categoria
                });
            }
        } else {
            await db.pg('log').insert({
                user_id: null,
                message: data,
                tipo: tipo,
                categoria: categoria
            });
        }
    },

    rejectLoad: async function (data) {
        db.pg('reject_load').where({ identificacion: data.identificacion, mes_de_pago: data.mes_de_pago }).then(async (result) => {
            if (result.length == 0) {
                await db.pg('reject_load').where({ legajo: data.legajo, mes_de_pago: data.mes_de_pago }).then(async (result) => {
                    if (result.length == 0) {
                        await db.pg('reject_load').insert({
                            identificacion: data.identificacion,
                            mes_de_pago: data.mes_de_pago,
                            numero_recibo: data.numero_recibo,
                            legajo: data.legajo,
                        });
                    }
                });
            }
        })
    },

    rejectLoadFront: async function (cedula, data, descripcion) {
        /*db.pg('reject_load').where({ identificacion: data.cedula, mes_de_pago: mesPago }).then(async(result) => {
            if (result.length == 0) {*/
        //await db.pg('reject_load').where({ legajo: data.legajo, mes_de_pago: data.mesdepago }).then(async(result) => {
        await db.pg('reject_load').insert({
            identificacion: cedula,
            mes_de_pago: data.mes_de_pago,
            numero_recibo: data.numero_recibo,
            empleado: data.nombres + " " + data.apellidos,
            descripcion: descripcion,
            tipo: 'Carga Planilla Excel',
            categoria: 'WARNING'
        }).then(async (result) => { }).catch(e => {
            console.log(e)
        })
        /*}).catch(e => {
            console.log(e)
        })*/
        //}
        //})
    },

    rejectLoadWs: async function (data, descripcion, tipo, categoria) {
        const mesPago = moment(data.mes_de_pago, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
        /*db.pg('reject_load').where({ identificacion: data.cedula, mes_de_pago: mesPago }).then(async(result) => {
            if (result.length == 0) {*/
        //await db.pg('reject_load').where({ legajo: data.legajo, mes_de_pago: data.mesdepago }).then(async(result) => {
        await db.pg('reject_load').insert({
            identificacion: data.ci,
            mes_de_pago: mesPago,
            numero_recibo: data.nro_recibo,
            empleado: data.nombres + " " + data.apellidos,
            descripcion: descripcion,
            tipo: tipo,
            categoria: categoria,
        }).then(async (result) => { }).catch(e => {
            console.log(e)
        })
        /*}).catch(e => {
            console.log(e)
        })*/
        //}
        //})
    },


    sendSMS: async function (telefono, data, message) {
        let body = {
            email: process.env.SMS_EMAIL,
            password: process.env.SMS_PASS
        }

        axios.post(
            process.env.SMS_HOST + 'login',
            body
        )
            .then(function (response) {
                let config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + response.data.data.token,
                        'Accept': 'application/json'
                    }
                };
                let body = {
                    nrodestino: telefono,
                    mensaje: message
                }
                axios.post(
                    process.env.SMS_HOST + 'send',
                    body,
                    config
                )
                    .then((response) => {
                        console.log(response)
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            })
            .catch(function (error) {
                console.log(error);
            });
    },

    verifyCertDate: async function (path, pass) {
        var command = `openssl pkcs12 -in ${process.cwd()}/${path} -nokeys -passin pass:${pass} | openssl x509 -noout -startdate -enddate`;
        console.log(command);
        try {
            const { stdout, stderr } = await exec(command);
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
            return stdout;
        } catch (e) {
            console.error(e); // should contain code (exit code) and signal (that caused the termination).
            return e;
        }
        /* return await openssl(command, function (err, buffer) {
            if (err) {
                console.log(err.toString());
                return err.toString();
            } 
            return buffer.toString();
        }); */
    },

    replaceChar: async function (data) {
        //! @ ^ = & / \ |# , + ( ) $ ~ % .. ` ~ ´ - _ ' " : * ? < > { }
        var result = '';
        for (var i = 0; i < data.length; i++) {
            var char = '';
            switch (data.substring(i, i + 1)) {
                case '!':
                    char = '\!';
                    break;
                case '@':
                    char = '\@';
                    break;
                case '^':
                    char = '\^';
                    break;
                case '=':
                    char = '\=';
                    break;
                case '&':
                    char = '\&';
                    break;
                case '/':
                    char = '\/';
                    break;
                case '\'':
                    char = '\\';
                    break;
                case '|':
                    char = '\|';
                    break;
                case '#':
                    char = '\#';
                    break;
                case ',':
                    char = '\,';
                    break;
                case '+':
                    char = '\+';
                    break;
                case '(':
                    char = '\(';
                    break;
                case ')':
                    char = '\)';
                    break;
                case '$':
                    char = '\$';
                    break;
                case '~':
                    char = '\~';
                    break;
                case '%':
                    char = '\%';
                    break;
                case '.':
                    char = '\.';
                    break;
                case ',':
                    char = '\,';
                    break;
                case '`':
                    char = '\`';
                    break;
                case '~':
                    char = '\~';
                    break;
                case '´':
                    char = '\´';
                    break;
                case '-':
                    char = '\-';
                    break;
                case '_':
                    char = '\_';
                    break;
                case "'":
                    char = "\'";
                    break;
                case '"':
                    char = '\"';
                    break;
                case ':':
                    char = '\:';
                    break;
                case '*':
                    char = '\*';
                    break;
                case '?':
                    char = '\?';
                    break;
                case '<':
                    char = '\<';
                    break;
                case '>':
                    char = '\>';
                    break;
                case '{':
                    char = '\{';
                    break;
                case '}':
                    char = '\}';
                    break;
                case '[':
                    char = '\[';
                    break;
                case ']':
                    char = '\]';
                    break;
                case ';':
                    char = '\;';
                    break;
                default:
                    char = data.substring(i, i + 1);
            }
            result = result + char;
        }
        return result;
    }
}