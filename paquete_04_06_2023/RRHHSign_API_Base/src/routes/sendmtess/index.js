var express = require("express");
var router = express.Router();
const db = require('../../modules/db/db');
const utils = require("../../modules/utils");
const moment = require('moment');
var FormData = require('form-data');
const fs = require("fs");
const axios = require('axios');
const { now } = require("moment");
const { join } = require("path");

router.post('/SendXMLToMTESS', async (req, res, next) => {
    try {

        var control = await db.pg.table('control')
        var invoice = await db.pg.table('xml').where('id', req.body.id)
        var path = 'src/public/xml/'
        var outputFile = path + invoice[0].hash_kude + '.xml'

        fs.writeFileSync(outputFile, invoice[0].xml);

        var data = new FormData();
        data.append('file', fs.createReadStream(outputFile));

        var config = {
            method: 'post',
            url: control[0].mtess_url,
            headers: {
                ...data.getHeaders()
            },
            data: data
        };

        await axios(config)
            .then(async function (response) {

                console.log(response.data.data)

                await db.pg.update({
                    envio_mtess: true,
                    envio_mtess_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                }).table('xml').where('id', req.body.id)

                await utils.insertLogsMtessXml(req.body.user_email, "Recibo:" + invoice[0].numero_recibo + ", Mensaje:" + response.data.data.message, invoice[0].id, invoice[0].numero_recibo, 'Envio al MTESS', 'INFO');

                return res.status(200).json(response.data)
            })
            .catch(async function (error) {
                console.log(error.response.data)

                let categoria = ''

                if (error.response.data.message.indexOf('Error') != -1 || error.response.data.message[0].indexOf('Error') != -1) {
                    categoria = "ERROR"
                } else if (error.response.data.message[0].indexOf('PATRONAL') != -1) {
                    categoria = "WARNING"
                } else {
                    categoria = "INFO"
                }

                await utils.insertLogsMtessXml(req.body.user_email, "Recibo:" + invoice[0].numero_recibo + ", Mensaje:" + JSON.stringify(error.response.data.message), invoice[0].id, invoice[0].numero_recibo, 'Envio al MTESS', categoria);

                return res.status(400).json(error.response.data)
            });

        fs.unlink(outputFile, (err) => {
            if (err) throw err;
            console.log('file deleted');
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            status: 'error',
            message: "Ocurrió un error, contácte con el administrador"
        })
    }
})

router.post('/SendDocumentXMLsToMTESS', async (req, res, next) => {
    try {
        var path = 'src/public/xml/'
        var control = await db.pg.table('control')
        var documents = await db.pg.table('xml')
            .where('send_mtess', true)
            .where('signature_employee', true)
            .where('document_id', req.body.id)
        let errores = []

        for (let i = 0; i < documents.length; i++) {

            var outputFile = path + documents[i].hash_kude + '.xml'

            fs.writeFileSync(outputFile, documents[i].xml);

            var data = new FormData();
            data.append('file', fs.createReadStream(outputFile));

            var config = {
                method: 'post',
                url: control[0].mtess_url,
                headers: {
                    ...data.getHeaders()
                },
                data: data
            };

            await axios(config)
                .then(async function (response) {

                    console.log(response.data.data)

                    await db.pg.update({
                        envio_mtess: true,
                        envio_mtess_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    }).table('xml').where('id', req.body.id)

                    await utils.insertLogsMtessXml(req.body.user_email, response.data.data.message, documents[i].id, documents[i].numero_recibo, 'Envio al MTESS en Lote', categoria);

                }).catch(async function (error) {

                    console.log(error.response.data)

                    let categoria = ''

                    if (error.response.data.message.indexOf('Error') != -1 || error.response.data.message[0].indexOf('Error') != -1) {
                        categoria = "ERROR"
                    } else if (error.response.data.message[0].indexOf('PATRONAL') != -1) {
                        categoria = "WARNING"
                    } else {
                        categoria = "INFO"
                    }

                    await utils.insertLogsMtessXml(req.body.user_email, error.response.data.message, documents[i].id, documents[i].numero_recibo, 'Envio al MTESS en Lote', categoria);

                    errores.push(error.response.data)
                });

            fs.unlink(outputFile, (err) => {
                if (err) throw err;
                console.log('file deleted');
            });
        }

        console.log(errores)

        if (errores.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Se detectaron algunas inconsistencias en el envio de documentos, verifique el log de errores!'
            })
        } else {
            return res.status(200).json({
                status: 'success',
                message: 'Documentos enviados exitósamente'
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            status: 'error',
            message: "Ocurrió un error, contácte con el administrador"
        })
    }
})


module.exports = router;