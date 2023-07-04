var express = require('express');
var router = express.Router();
require("dotenv-safe").load();
const db = require('../../modules/db/db');
const utils = require('../../modules/utils');
var moment = require("moment");
var cron = require('node-cron');
const xl = require('excel4node');
var fs = require('fs');

cron.schedule('00 00 09 * * MON', () => {
    /*Campo	    ¿Es obligatorio?	Valores Permitidos	Caracteres especiales
      Segundos	        SI	        0-59	                    , – * /
      Minutos	        SI	        0-59	                    , – * /
      Horas	            SI	        0-23	                    , – * /
      Día del mes	    SI	        1-31	                    , – * ? / L W
      Mes	            SI	        1-12 o JAN-DEC	            , – * /
      Día de la semana	SI	        1-7 o SUN-SAT	            , – * ? / L #
      Año	            NO	        Vacio | 1970-2099	        , – * /*/
    send_notificacion()
});

async function send_notificacion() {
    var fecha = moment().format();
    var dias = moment(fecha).add(45, 'days');
    var end_date = moment(dias.toString()).format('YYYY-MM-DD')
    var start_date = moment().format('YYYY-MM-DD');

    console.log("vencimiento: " + end_date)

    const certificados = await db.pg('employee')
        .select('employee.identification', 'employee.nombres', 'employee.apellidos', 'employee.email',
            'employee.cert_type', 'employee.cert_start', 'employee.cert_end')
        .join('usuario', 'usuario.id', 'employee.user_id')
        .where('employee.cert_end', '>=', start_date)
        .where('employee.cert_end', '<=', `${end_date} 23:59:59`)
        .where('usuario.active', true)
        .orderBy('employee.cert_end', 'desc')

    var archivo = './src/docs/Lista-de-certificados.xlsx';

    if (certificados.length > 0) {
        createSheet(certificados).then(file => {
            file.write(archivo);
        })

        let response = await EnviaNotificacion(process.env.EMAIL_NOTIF, archivo);
        console.log(response)

        setTimeout(() => {
            fs.unlink(archivo, (err) => {
                if (err) throw err;
                console.log('file deleted');
            });
        }, 10000);

    } else {
        console.log("nada para reportar")
    }
}

function createSheet(certificates) {

    return new Promise(resolve => {

        // setup workbook and sheet
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet('Sheet');

        // Add a title row
        var rowOffset = 0

        ws.cell(1 + rowOffset, 1)
            .string('Cedula')

        ws.cell(1 + rowOffset, 2)
            .string('Nombres')

        ws.cell(1 + rowOffset, 3)
            .string('Apellidos')

        ws.cell(1 + rowOffset, 4)
            .string('Email')

        ws.cell(1 + rowOffset, 5)
            .string('Tipo Certificado')

        ws.cell(1 + rowOffset, 6)
            .string('Fecha Emisión')

        ws.cell(1 + rowOffset, 7)
            .string('Fecha Vencimiento')

        // add data from json

        for (let i = 0; i < certificates.length; i++) {

            let row = i + rowOffset + 2

            if (certificates[i].cert_start) {
                var cert_start = moment(certificates[i].cert_start).add(1, 'days').format('DD/MM/YYYY')
            } else {
                var cert_start = "No estimado"
            }

            if (certificates[i].cert_end) {
                var cert_end = moment(certificates[i].cert_end).add(1, 'days').format('DD/MM/YYYY')
            } else {
                var cert_end = "No estimado"
            }

            ws.cell(row, 1)
                .string(certificates[i].identification)

            ws.cell(row, 2)
                .string(certificates[i].nombres)

            ws.cell(row, 3)
                .string(certificates[i].apellidos)

            ws.cell(row, 4)
                .string(certificates[i].email)

            ws.cell(row, 5)
                .string(certificates[i].cert_type)

            ws.cell(row, 6)
                .string(cert_start)

            ws.cell(row, 7)
                .string(cert_end)
        }

        resolve(wb)

    })
}

async function EnviaNotificacion(destinatario, archivo) {

    var html = `<p>Algunos certificados estan por vencer</p><p>Atentamente.</p>`;

    let email = {
        to: destinatario,
        subject: 'Vencimiento de Certificados',
        html: html,
        attachments: archivo
    };
    return await utils.sendNotificacion(email);
}

router.post('/send-reminder', async function (req, res, next) {
    //buscar o remetente
    db.pg.select('*')
        .table('employee')
        .join('usuario', 'employee.user_id', 'usuario.id')
        .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
        .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
        .where({ 'user_profile.profile_slug': req.body.profile, 'employee.email': req.body.from, 'employee.send_mail': 1 })
        .then(employees => {
            if (employees.length === 0) {
                res.status(400).send({ message: "El usuario no tiene habilitado el envio de notificaciones" });
            } else {
                //buscar o(s) destinatário(s)
                if (employees[0].profile_slug === 'rh') {
                    console.log("firma de rrhh");
                    db.pg.select('*')
                        .table('employee')
                        .join('usuario', 'employee.user_id', 'usuario.id')
                        .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
                        .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
                        .where('user_profile.profile_slug', '=', 'director')
                        .then(async directors => {
                            let response = await EnviaEmail(directors[0], req, res, next);
                            console.log(response)
                            if (response.status === 'success') {
                                res.status(200).send({ message: "Correo electrónico enviado" });
                            } else {
                                console.log(response);
                                res.status(404).send({ message: "No se pudo enviar el correo electrónico" });
                            }

                        })
                        .catch(err => {
                            res.status(400).send({ message: "Error al recuperar el destinatario: " + err });
                        });
                } else if (employees[0].profile_slug === 'director') {
                    console.log("el director ha firmado");
                    //busca todos os empregados relacionados ao documento informado
                    db.pg.select('employee.*')
                        .table('document')
                        .join('xml', 'xml.document_id', 'document.id')
                        .join('employee', 'employee.id', 'xml.employee_id')
                        .whereRaw(req.body.documentId ? `document.id = '${req.body.documentId}'` : `xml.id = '${req.body.xmlId}'`)
                        .then(async results => {
                            let mapResults = results.map(async result => {
                                let response = await EnviaEmailEmployee(result, req, res, next);
                                console.log(response)
                                if (response.status === 'success') {
                                    return true;
                                } else {
                                    console.log(response);
                                    return false
                                }
                            });

                            if (mapResults.some(result => {
                                result === false;
                            })) {
                                res.status(400).send({ message: "Error al enviar correo electrónico" });
                            } else {
                                res.status(200).send({ message: "Correo electrónico enviado" });
                            }
                        })
                        .catch(err => {
                            res.status(400).send({ message: "Error al recuperar el destinatario: " + err });
                        });
                }
            }
        })
        .catch(err => {
            res.status(400).send({ message: "Error al recuperar el remitente: " + err });
        });
});

router.post('/send-reminder-employee', async function (req, res, next) {
    //buscar o remetente
    db.pg.select('*')
        .table('employee')
        .join('usuario', 'employee.user_id', 'usuario.id')
        .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
        .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
        .where({ 'user_profile.profile_slug': req.body.profile, 'employee.email': req.body.from, 'employee.send_mail': 1 })
        .then(employees => {
            if (employees.length === 0) {
                res.status(400).send({ message: "El usuario no tiene habilitado el envio de notificaciones" });
            } else {
                //buscar o(s) destinatário(s)
                console.log("Notificar Empleados pendientes de firma");
                //busca todos os empregados relacionados ao documento informado
                db.pg.select('employee.*')
                    .table('document')
                    .join('xml', 'xml.document_id', 'document.id')
                    .join('employee', 'employee.id', 'xml.employee_id')
                    .where('xml.signature_employee', false)
                    .whereRaw(req.body.documentId ? `document.id = '${req.body.documentId}'` : `xml.id = '${req.body.xmlId}'`)
                    .then(async results => {
                        let mapResults = results.map(async result => {
                            let response = await EnviaEmailEmployee(result, req, res, next);
                            console.log(response)
                            if (response.status === 'success') {
                                return true;
                            } else {
                                console.log(response);
                                return false
                            }
                        });

                        if (mapResults.some(result => {
                            result === false;
                        })) {
                            res.status(400).send({ message: "Error al enviar correo electrónico" });
                        } else {
                            res.status(200).send({ message: "Correo electrónico enviado" });
                        }
                    })
                    .catch(err => {
                        res.status(400).send({ message: "Error al recuperar el destinatario: " + err });
                    });

            }
        })
        .catch(err => {
            res.status(400).send({ message: "Error al recuperar el remitente: " + err });
        });
});

router.post('/support', async (req, res, next) => {
    const users = await db.pg('usuario')
        .where('email', req.body.email)

    const user = users[0]

    const html = `
        <h1>Queja recibida de ${user.name}</h1>
        <p>${req.body.queja}</p>
    `

    let email = {
        from: process.env.HOST,
        to: process.env.EMAIL_USER,
        toName: 'Soporte',
        subject: 'Queja/inquietud recibida',
        html: html,
    };

    await utils.sendMail(email)

    return res.send({
        status: 'ok'
    })
})

async function EnviaEmailEmployee(data, req, res, next) {
    let to = data.email; // 'andre.santos@digitalife.com.py';
    console.log("enviando correo a=" + to);
    let toName = data.nombres + " " + data.apellidos;
    const messages = await db.pg('email_config')
        .where('slug', 'notification-reminder-employee')
    var html = '';
    if (messages.length > 0) {
        html = '<h3>Hola ' + toName + '!</h3>' + messages[0].message;
    } else {
        html = `<h3>Hola ${toName}<h3><p>El Departamento de Recursos Humanos le recuerda que tiene documentos pendientes de firma en su bandeja de Documentos Laborales Electrónicos.</p><p>Restan 12 horas para regularizar el estado.</p><p>Atentamente.</p>`;
    }

    let email = {
        from: 'Digitalife',
        to: to,
        toName: toName,
        subject: 'Mensaje recordatorio de firma',
        html: html,
        id_plantilla: process.env.EMAIL_WS_AVISO_FIRMA
    };
    // return await axios.post('https://dataflow.code100sa.com.py/api/email/send', email)
    let control = await db.pg('control');
    if (control[0].ext_email) {
        return await utils.sendMailExt(email);
    } else {
        return await utils.sendMail(email);
    }
}

async function EnviaEmail(data, req, res, next) {
    console.log("correos=" + data.email.length);
    let to = '';
    if (data.email.length > 1) {
        to = data.email[0];
    } else {
        to = data.email;
    }

    let toName = data.nombres + " " + data.apellidos;
    const messages = await db.pg('email_config')
        .where('slug', 'notification-reminder-director')
    var html = '';
    if (messages.length > 0) {
        html = '<h3>Hola ' + toName + '!</h3>' + messages[0].message;
    } else {
        html = `<h3>Hola ${toName}<h3><p>El Departamento de Recursos Humanos le recuerda que tiene documentos pendientes de firma en su bandeja de Documentos Laborales Electrónicos.</p><p>Restan 12 horas para regularizar el estado.</p><p>Atentamente.</p>`;
    }

    let email = {
        from: 'Digitalife',
        to: to,
        toName: toName,
        subject: 'Mensaje recordatorio de firma',
        html: html,
        id_plantilla: process.env.EMAIL_WS_AVISO_FIRMA
    };
    // return await axios.post('https://dataflow.code100sa.com.py/api/email/send', email)
    let control = await db.pg('control');
    if (control[0].ext_email) {
        return await utils.sendMailExt(email);
    } else {
        return await utils.sendMail(email);
    }
}

module.exports = router;