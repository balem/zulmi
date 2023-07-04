var express = require("express");
var router = express.Router();
const db = require('../../modules/db/db');
require("dotenv-safe").load();
const pathToDestination = './control';

router.get("/list/", async function(req, res, next) {
    //Cargamos los valores para la empres, ver el token que retorna
    const result = await db.pg.table('company').select('id', 'razon_social', 'ruc', 'ips_patronal').then((result) => {
        res.status(200).json({
            status: "success",
            data: result
        });
    })
});

router.get("/", async function(req, res, next) {
    //Cargamos los valores para la empres, ver el token que retorna
    await db.pg.table('company').select('id', 'razon_social', 'ruc', 'ips_patronal').then((result) => {
        res.status(200).json({
            status: "success",
            data: result
        });
    })
});

router.get("/:id", async function(req, res, next) {
    //Cargamos los valores para la empres, ver el token que retorna
    await db.pg.table('company').where('id', req.params.id).select('id', 'razon_social', 'ruc', 'ips_patronal').then((result) => {
        res.status(200).json({
            status: "success",
            data: result
        });
    })
});


router.delete("/:id", async function(req, res, next) {
    //Cargamos los valores para la empres, ver el token que retorna
    await db.pg.table('company').where('id', req.params.id).del().then((result) => {
        res.status(200).json({
            status: "success",
            data: result
        });
    })
});

router.put("/:id", async function(req, res, next) {
    //Guarda los registros de una empresa
    var { id } = req.params;
    var data = req.body;
    const result = await db.pg('company').where({ id }).update(data);
    if (result) {
        res.status(200).json({ success: result })
    } else {
        res.status(415).json({ "error": "no se actualizo" })
    }
});

router.post("/", async function(req, res, next) {
    //Genera un nuevo registro de empresa
    var data = req.body;
    const result = await db.pg('company').insert(data);
    if (result) {
        res.status(200).json({ success: result.rowCount })
    } else {
        res.status(415).json({ "error": "no se genero" })
    }
});

router.get("/mtess/:id", async function(req, res, next) {
    await db.pg.table('patronal').where('mtess_patronal', req.params.id).select('company_id').then(async(values) => {
        //Cargamos los valores para la empres, ver el token que retorna
        await db.pg.table('company').where('id', values[0].company_id).select('id', 'razon_social', 'ruc', 'ips_patronal').then((result) => {
            res.status(200).json({
                status: "success",
                data: result
            });
        })
    })
});

module.exports = router;