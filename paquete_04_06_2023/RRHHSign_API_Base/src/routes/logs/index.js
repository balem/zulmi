const IncomingForm = require("formidable").IncomingForm;
var express = require("express");
var router = express.Router();
var moment = require("moment");
const db = require('../../modules/db/db');
const xl = require('excel4node');
const utils = require("../../modules/utils");
var fs = require('fs');
var cron = require('node-cron');

cron.schedule('* * * * * *', () => {
    /*Campo	    ¿Es obligatorio?	Valores Permitidos	Caracteres especiales
      Segundos	        SI	        0-59	                    , – * /
      Minutos	        SI	        0-59	                    , – * /
      Horas	            SI	        0-23	                    , – * /
      Día del mes	    SI	        1-31	                    , – * ? / L W
      Mes	            SI	        1-12 o JAN-DEC	            , – * /
      Día de la semana	SI	        1-7 o SUN-SAT	            , – * ? / L #
      Año	            NO	        Vacio | 1970-2099	        , – * /*/
    create_log()
});

async function create_log() {
    let data = []
    var fecha = moment().format("YYYY-MM-DD");
    const logs = await db.pg('log')
        .join('usuario', 'log.user_id', 'usuario.id')
        .select('log.id', 'usuario.name', 'usuario.email', 'log.message', 'log.recibo', 'log.tipo', 'log.categoria', 'log.created_at')
        .where('log.created_at', '>=', fecha)
        .where('log.created_at', '<=', `${fecha} 23:59:59`)
        .orderBy('log.created_at', 'desc')

    const rejects = await db.pg('reject_load')
        .select('id', 'mes_de_pago', 'descripcion', 'numero_recibo', 'tipo', 'categoria', 'created_at')
        .where('created_at', '>=', fecha)
        .where('created_at', '<=', `${fecha} 23:59:59`)
        .orderBy('created_at', 'desc')

    if (logs.length > 0) {
        logs.forEach(element => {
            let log = {
                id: element.id,
                level: element.categoria,
                event: element.tipo,
                usuario: element.name,
                email: element.email,
                message: element.message,
                recibo: element.recibo,
                creado: element.created_at
            };
            data.push(log);
        });
    }

    if (rejects.length > 0) {

        if (logs.length > 0) {
            rejects.forEach(element => {
                var fechaPago = moment(element.mes_de_pago).format()
                var fecha = moment(fechaPago.toString().split("T")[0]).add(1, 'days')
                let reject = {
                    id: element.id,
                    level: element.categoria,
                    event: element.tipo,
                    usuario: logs[0].name,
                    email: logs[0].email,
                    message: element.descripcion + "/Mes: " + moment(fecha.toString().split("Moment")[0]).format("MM/YYYY"),
                    recibo: element.numero_recibo,
                    creado: element.created_at
                };
                data.push(reject);
            });
        } else {
            const user = await db.pg('usuario')
                .join('usuario_perfiles', 'usuario_perfiles.user_id', 'usuario.id')
                .join('user_profile', 'user_profile.id', 'usuario_perfiles.profile_id')
                .select('usuario.name', 'usuario.email')
                .where('user_profile.profile_slug', 'rh')

            rejects.forEach(element => {
                var fechaPago = moment(element.mes_de_pago).format()
                var fecha = moment(fechaPago.toString().split("T")[0]).add(1, 'days')
                let reject = {
                    id: element.id,
                    level: element.categoria,
                    event: element.tipo,
                    usuario: user[0].name,
                    email: user[0].email,
                    message: element.descripcion + "/Mes: " + moment(fecha.toString().split("Moment")[0]).format("MM/YYYY"),
                    recibo: element.numero_recibo,
                    creado: element.created_at
                };
                data.push(reject);
            });

        }

    }

    if (data.length > 0) {
        let result = JSON.stringify(data, null, 2);

        fs.writeFile('./src/Logs/' + moment().format("YYYY-MM-DD") + '_talento100.log', result, (err) => {
            if (err) throw err;
        });
    }
}

router.get('/create', async(req, res, next) => {
    let message = "Usuario: " + req.query.user;
    utils.insertLogs(req.query.user, message, 'Cierre Sesión', 'INFO');
});

router.get('/', async(req, res, next) => {
    const userId = req.query['user_id']
    const dateFrom = req.query['date_from']
    const dateTo = req.query['date_to']
    const tipolog = req.query['tipolog']

    let query = db.pg('log')
        .join('usuario', 'log.user_id', 'usuario.id')
        .select('log.id', 'usuario.name', 'usuario.id', 'log.message', 'log.recibo', 'log.created_at')
        .orderBy('log.created_at', 'desc')

    if (userId) {
        query = query.where('log.user_id', userId)
    }

    if (dateFrom) {
        query = query.where('log.created_at', '>=', dateFrom)
    }

    if (dateTo) {
        query = query.where('log.created_at', '<=', `${dateTo} 23:59:59`)
    }

    if (tipolog == 'CARGA') {
        query = query.where('log.message', 'like', '%Carga%')
    } else if (tipolog == 'FIRMA') {
        query = query.where('log.message', 'like', '%Firma%')
    } else if (tipolog == 'EMPLEADOS') {
        query = query.where('log.message', 'like', '%empleados%')
    } else {
        query = query.where('log.message', 'like', '%%')
    }

    query.then(logs => res.json({
        status: 'success',
        data: logs
    }))
})

router.get('/problem-employees-excel', async(req, res, next) => {
    var fecha = moment(req.query.fecha).format("YYYY-MM-DD");
    //.where('message', 'like', `%Alta%`)
    const empleados = await db.pg('log')
        .where('message', 'like', '%empleado%')
        .where('created_at', '>=', fecha);
    console.log(empleados)
    createSheetLog(fecha, empleados).then(file => {
        file.write(`Carga masiva de empleados-${fecha.replace('/', '-')}.xlsx`, res);
    })
})

function createSheetLog(periodo, xmls) {

    return new Promise(resolve => {

        // setup workbook and sheet
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet('Sheet');

        const rowOffset = periodo ? 1 : 0

        if (periodo) {
            ws.cell(1, 1)
                .string('Fecha: ' + moment(periodo, 'YYYY-MM-DD').format('DD/MM/YYYY'))
        }
        // Add a title row
        ws.cell(1 + rowOffset, 1)
            .string('Descripcion')
            // add data from json

        for (let i = 0; i < xmls.length; i++) {

            let row = i + rowOffset + 2

            ws.cell(row, 1)
                .string(xmls[i].message)
        }

        resolve(wb)

    })
}

router.get('/dates', async(req, res, next) => {
    var dates = await db.pg('reject_load').select('mes_de_pago').groupBy('mes_de_pago');
    console.log(dates);
    res.json({
        status: 'success',
        data: dates
    });
});

router.post('/load', async(req, res, next) => {
    const mesPago = moment(req.body.mes_de_pago, 'MM/YYYY').startOf('month').format('YYYY-MM-DD')
    if (req.body.mes_de_pago) {
        await db.pg('reject_load').where('mes_de_pago', '=', mesPago).orderBy('created_at', 'desc')
            .then((result) => {
                res.json({
                    status: 'success',
                    data: result
                })
            });
    }
});

module.exports = router;