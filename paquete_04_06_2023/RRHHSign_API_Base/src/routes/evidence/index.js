var express = require("express");
var router = express.Router();
const db = require('../../modules/db/db');
const utils = require("../../modules/utils");
const moment = require('moment');
const fs = require("fs");
const axios = require('axios');

router.get('/header', async(req, res, next) => {
    try {
        var subqueryDocu = await db.pg('document').select('id').where('id', '=', db.pg('xml').select('document_id').where('envio_mtess', true).orderBy('created_at', 'desc').limit('1')).orderBy('created_at').limit('1');
    } catch (e) {
        console.log(e);
    }
    var subqueryDate = db.pg('document').select(db.pg.raw('getDate() as created_at')).where('id', '=', db.pg('xml').select('document_id').where('envio_mtess', true).orderBy('created_at', 'desc').limit('1')).orderBy('created_at').limit('1').as('last_data');
    var subqueryCant = db.pg('xml').count('id').where({ document_id: subqueryDocu[0]['id'], envio_mtess: true }).as('cant');
    var subqueryDoId = db.pg('document').select('id').where('id', '=', db.pg('xml').select('document_id').where('envio_mtess', true).orderBy('created_at', 'desc').limit('1')).orderBy('created_at').limit('1').as('document_id');
    try {
        var company = await db.pg('company as c')
            .join('patronal as p', 'c.id', '=', 'p.company_id')
            .select('c.razon_social', 'c.ruc', 'p.mtess_patronal', 'c.hash', subqueryDate, subqueryCant, subqueryDoId)
            .where('c.id', '=', db.pg('xml').select('company_id').where('envio_mtess', true).orderBy('created_at', 'desc').limit('1')).catch(e => { console.log(e) });
    } catch (e) {
        console.log(e);
    }
    return res.json({
        status: 'success',
        data: {
            company
        }
    })

    //.raw('select company_id from xml where envio_mtess = true order by created_at asc limit 1')
    /* var document = await db.pg('document').select('created_at', 'id').orderBy('created_at', 'desc').limit('1')
    company[0]['last_date'] = document[0]['created_at'];
    company[0]['document_id'] = document[0]['id'];
    var quantities = await db.pg('xml').count({cant: 'id'}).where('document_id', document[0]['id'])
    company[0]['amount'] = quantities[0]['cant']; */
});

router.get('/detail', async(req, res, next) => {
    const id = req.query.id;
    var details = await db.pg('xml as x')
        .join('employee as e', 'x.employee_id', '=', 'e.id')
        .select('x.envio_mtess_date', 'e.nombres', 'e.apellidos',
            'e.identification',
            'x.total_neto',
            'x.hash_kude as hash')
        .where('x.document_id', id)
        .where('x.envio_mtess', true);

    return res.json({
        status: 'success',
        data: {
            details
        }
    })
});
module.exports = router;