const IncomingForm = require("formidable").IncomingForm;
var express = require("express");
var router = express.Router();
var fs = require('fs');
var eyes = require('eyes').inspector({ styles: { all: 'magenta' } });
const db = require('../../modules/db/db');
const utils = require("../../modules/utils");
const XLSX = require('xlsx');
const moment = require('moment');
const momentESLocale = require("moment/locale/es");
var XmlBuilder = require('xmlbuilder');

router.get('/', async (req, res, next) => {
    db.pg('email_config')
    .then(config => res.json({
        data: config
    }))
})

router.get('/:slug', async (req, res, next) => {
    db.pg('email_config')
    .where('slug', req.params.slug)
    .then(config => res.json({
        data: config
    }))
})

router.post('/:slug', async (req, res, next) => {
    db.pg('email_config')
    .where('slug', req.params.slug)
    .update({
        subject: req.body.subject,
        message: req.body.message,
    })
    .then(() => res.json({
        status: 'success'
    }))
    .catch(e => {
        console.log('Error updating email:', e)
        return res.status(200).json({
            status: 'error',
            data: e
        })
    })
})

module.exports = router;