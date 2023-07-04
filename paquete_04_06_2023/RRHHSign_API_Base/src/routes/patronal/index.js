var express = require("express");
var router = express.Router();
const db = require('../../modules/db/db');
require("dotenv-safe").load();
const pathToDestination = './control';

router.get("/", async function(req, res, next) {
  //Cargamos los valores para la empres, ver el token que retorna
  await db.pg('patronal').select('mtess_patronal').then((result) => {
    res.status(200).json({
      status: "success",
      data: result
    });
  })
});

router.get("/:id", async function(req, res, next) {
  //Cargamos los valores para la empres, ver el token que retorna
  await db.pg('patronal').where('company_id', req.params.id).select('mtess_patronal').then((result) => {
    res.status(200).json({
      status: "success",
      data: result
    });
  })
});

module.exports = router;
