var express = require("express");
var router = express.Router();
const db = require('../../modules/db/db');
var axios = require('axios');
const { response } = require("express");
var moment = require("moment");
var request = require("request");
const utils = require("../../modules/utils");

router.get("/", async function(req, res, next) {
    let ci = req.query.ci;
    let periodo = req.query.periodo;
    let message = 'CI:' + ci + "/Mes: " + periodo;
    let status = '';
    utils.insertLogs(req.query.email, message, 'Verificación del envio al MTESS', 'INFO');

    let company = await db.pg('company').select('mtess_url');
    db.pg('employee').where('identification', '=', ci).select('id').then((id) => {
        console.log(id)
        db.pg('xml').where({ employee_id: id[0].id, periodo: moment(periodo, 'MM-YYYY').format("YYYY-MM") }).select('hash_kude').then((hashKude) => {

            if (hashKude.length > 0) {
                request(company[0].mtess_url + `/xml/status?hash=${hashKude[0].hash_kude}`, function(error, response, body) {

                    if (!error && response.statusCode == 200) {
                        let data = JSON.parse(response.body)
                        console.log(data.message.length)
                        if (data.message.length <= 22) {
                            status = data.message
                        } else if (data.message.length > 22) {
                            status = JSON.parse(data.message.substr(data.message.indexOf("]") + 1))
                        } else {
                            status = '';
                        }

                        utils.insertLogs(req.query.email, JSON.stringify(status), 'Verificación del envio al MTESS', 'INFO');

                        return res.status(200).json(JSON.parse(response.body));
                    } else {
                        console.log(error)
                        utils.insertLogs(req.query.email, error, 'Verificación del envio al MTESS', 'ERROR');
                        return res.status(500).json(error);
                    }
                })
            } else {
                utils.insertLogs(req.query.email, 'No existen recibos en el periodo solicitado', 'Verificación del envio al MTESS', 'WARNING');
                return res.status(404).json({
                    status: "error",
                });
            }

        })
    }).catch(function(e) {
        utils.insertLogs(req.query.email, e.message, 'Verificación del envio al MTESS', 'ERROR');
        return res.status(400).json({
            status: "error",
            message: e.message
        });
    });


});

router.get("/multas", async function(req, res, next) {
    const patronal = req.query.ipsPatronal;
    const cINro = req.query.ci;
    let status = '';

    let message = 'Patronal-' + patronal + "/CI-" + cINro;
    utils.insertLogs(req.query.email, message, 'Consulta de multas', 'INFO');

    request("https://integra.mtess.gov.py/empr_emple_multa/empresa_empleado/consul_empre_emple.php?patronal=" + patronal + "&cedula=" + cINro, function(error, response, body) {

        if (!error && response.statusCode == 200) {
            let data = JSON.parse(response.body)
            if (data.messages) {
                status = data.messages[0].error[0]
            } else {
                status = JSON.stringify(data['Datos_empleados '][0])
            }

            utils.insertLogs(req.query.email, status, 'Verificación del envio al MTESS', 'INFO');
            return res.status(200).json(JSON.parse(response.body));
        } else {
            console.log(error)
            utils.insertLogs(req.query.email, error, 'Consulta de multas', 'ERROR');
            return res.status(500).json(error);
        }
    })

});


module.exports = router;