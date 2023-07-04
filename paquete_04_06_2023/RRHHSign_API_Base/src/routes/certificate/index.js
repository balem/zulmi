const IncomingForm = require("formidable").IncomingForm;
var express = require("express");
var router = express.Router();
var moment = require("moment");
const db = require('../../modules/db/db');
const fs = require('fs');
var JSZip = require("jszip");
const utils = require("../../modules/utils");
const xl = require('excel4node');

router.get('/download', async(req, res, next) => {
    let certificates = await db.pg('employee')
    var fecha = moment().format("DD-MM-YYYY HH:mm:ss");
    createSheet(certificates).then(file => {
        file.write(`Lista-de-certificados-${fecha}.xlsx`, res);
    })
})

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
            .string('Tipo Certificado')

        ws.cell(1 + rowOffset, 5)
            .string('Fecha Emisión')

        ws.cell(1 + rowOffset, 6)
            .string('Fecha Vencimiento')

        // add data from json

        for (let i = 0; i < certificates.length; i++) {

            let row = i + rowOffset + 2

            if (certificates[i].cert_start) {
                var cert_start = moment(certificates[i].cert_start).format('DD/MM/YYYY')
            } else {
                var cert_start = "No estimado"
            }

            if (certificates[i].cert_end) {
                var cert_end = moment(certificates[i].cert_end).format('DD/MM/YYYY')
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
                .string(certificates[i].cert_type)

            ws.cell(row, 5)
                .string(cert_start)

            ws.cell(row, 6)
                .string(cert_end)
        }

        resolve(wb)

    })
}


router.get('/check', async(req, res, next) => {
    const user = await db.pg('employee')
        .where('email', req.query.email)
    const company = await db.pg('company')

    const exists = fs.existsSync(`./openssl/certificates/empresa-${company[0].ruc}/ci-${user[0].identification}/certificate.pfx`)

    return res.json({
        status: 'success',
        data: {
            exists
        }
    })
})

router.post('/upload', async(req, res, next) => {
    var form = new IncomingForm();

    return form.parse(req, async(err, fields, files) => {
        let oldpath = files.file.path;

        const user = await db.pg('employee')
            .where('email', fields.email)

        const master = await db.pg('usuario')
            .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
            .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
            .where('usuario.email', fields.email)
            .where('user_profile.profile_slug', 'master')

        if (files.file.name.split('.')[1] == 'pfx') {

            if (master.length > 0 || user.length > 0) {

                const employee = await db.pg('employee')
                    .where('identification', files.file.name.split('.')[0])

                if (employee.length > 0) {

                    const company = await db.pg('company')
                    const dateStr = moment().format('YYYY-MM-DD HH:mm:ss');
                    const baseDir = `./openssl/certificates/empresa-${company[0].ruc}/ci-${master.length == 0 ? user[0].identification : files.file.name.split('.').slice(0, -1).join('.')}`

                    if (!fs.existsSync(baseDir)) {
                        fs.mkdirSync(baseDir, {
                            recursive: true
                        })
                    }

                    let newpath = `${baseDir}/certificate.pfx`;

                    const source = fs.createReadStream(oldpath)
                    const dest = fs.createWriteStream(newpath)

                    var stats = fs.statSync(baseDir);
                    var fileSizeInBytes = stats.size;
                    if (fileSizeInBytes < process.env.SIZE) {
                        let message = 'Tamaño del certificado excedido';
                        utils.insertLogs(fields.email, message, 'Alta individual de certificado', 'WARNING');
                        await db.pg("employee")
                            .where("identification", master.length == 0 ? user[0].identification : files.file.name.split('.').slice(0, -1).join('.'))
                            .update({
                                cert_added: true,
                                cert_date: dateStr,
                                cert_correct: false
                            });
                        return res.status(400).json({
                            status: 'error',
                            data: 'Tamaño del certificado excedido',
                        });
                    }

                    await db.pg('employee')
                        .where('identification', master.length == 0 ? user[0].identification : files.file.name.split('.').slice(0, -1).join('.'))
                        .update({
                            cert_added: true,
                            cert_date: dateStr,
                            cert_correct: true
                        })
                    let message = 'Certificado importado: CI-' + files.file.name.split('.').slice(0, -1).join('.');
                    utils.insertLogs(fields.email, message, 'Alta individual de certificado', 'INFO');

                    source.pipe(dest)
                    source.on('end', () => {

                        return res.status(200).json({
                            status: 'success',
                            data: 'Certificado importado exitosamente',
                        });
                    })

                    source.on('error', err => {
                        let message = 'Informacion Inválida enviada a la API';
                        utils.insertLogs(fields.email, message, 'Alta individual de certificado', 'ERROR');
                        return res.send({
                            status: 'error',
                            data: 'Informacion Inválida enviada a la API'
                        });
                    })


                } else {
                    let message = 'El empleado no existe/' + files.file.name.split('.')[0];
                    utils.insertLogs(fields.email, message, 'Alta individual de certificado', 'WARNING');
                    return res.status(400).json({
                        status: 'error',
                        data: 'El empleado no existe',
                    });
                }

            } else {
                return res.send({
                    status: 'error',
                    data: 'Usuario no válido',
                })
            }

        } else {
            let message = 'Tipo de archivo no válido ' + "'" + files.file.name.split('.')[1] + "'";
            utils.insertLogs(fields.email, message, 'Alta individual de certificado', 'WARNING');
            return res.status(400).json({
                status: 'success',
                data: 'El tipo de archivo no es válido',
            });
        }

    });
})

router.post('/mass-upload', async(req, res, next) => {
    var form = new IncomingForm();

    return form.parse(req, async(err, fields, files) => {
        let oldpath = files.file.path;
        const dateStr = moment().format('YYYY-MM-DD HH:mm:ss');
        const master = await db.pg('usuario')
            .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
            .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
            .where('usuario.email', fields.email)
            .where('user_profile.profile_slug', 'master')

        let message = 'Alta masiva de certificados';
        utils.insertLogs(fields.email, message, 'Alta masiva de certificados', 'INFO');

        const company = await db.pg('company').select('ruc');

        if (files.file.name.split('.')[1] == 'zip') {

            fs.readFile(oldpath, function(err, data) {
                if (err) throw err;
                JSZip.loadAsync(data).then(function(zip) {
                    Object.keys(zip.files).forEach(async filename => {

                        const identification = filename.replace(/\.[^/.]+$/, "")

                        if (filename.split(".")[1] == 'pfx') {

                            const employeesCount = await db.pg('employee')
                                .where('identification', identification)

                            const baseDir = `./openssl/certificates/empresa-${company[0].ruc}/ci-${identification}`
                            const newPath = `${baseDir}/certificate.pfx`

                            if (employeesCount.length > 0) {

                                if (!fs.existsSync(baseDir)) {
                                    fs.mkdirSync(baseDir, {
                                        recursive: true
                                    })
                                }
                                zip.file(filename)
                                    .async('nodebuffer')
                                    .then(async function(content) {
                                        fs.writeFileSync(newPath, content);
                                        var stats = fs.statSync(newPath);
                                        var fileSizeInBytes = stats.size;
                                        var correct = true;
                                        if (fileSizeInBytes < process.env.SIZE) {
                                            correct = false;
                                        }

                                        let message = 'Certificado importado: CI-' + identification
                                        utils.insertLogs(fields.email, message, 'Alta masiva de certificados', 'INFO');

                                        await db.pg('employee')
                                            .where('identification', identification)
                                            .update({
                                                cert_added: true,
                                                cert_date: dateStr,
                                                cert_correct: correct
                                            })
                                    });
                            } else {
                                let message = 'El empleado no existe/' + identification;
                                utils.insertLogs(fields.email, message, 'Alta masiva de certificados', 'WARNING');
                            }

                        } else {
                            let message = 'Tipo de archivo no válido ' + "'" + filename.split(".")[1] + "'";
                            utils.insertLogs(fields.email, message, 'Alta masiva de certificados', 'WARNING');
                        }

                    })

                    return res.status(200).json({
                        status: 'success',
                        data: 'Certificados importados exitosamente',
                    });
                });
            });

        } else {

            let message = 'Tipo de archivo no válido ' + "'" + files.file.name.split('.')[1] + "'";
            utils.insertLogs(fields.email, message, 'Alta masiva de certificados', 'WARNING');
            return res.status(400).json({
                status: 'success',
                data: 'El tipo de archivo no es válido',
            });

        }

    });
})

module.exports = router;