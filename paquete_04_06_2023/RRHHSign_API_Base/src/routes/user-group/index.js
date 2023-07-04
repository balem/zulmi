var express = require("express");
var router = express.Router();
const db = require("../../modules/db/db");
const utils = require("../../modules/utils");
const { IncomingForm } = require("formidable");
const XLSX = require('xlsx');
require("dotenv-safe").load();

router.get("/all", async(req, res, next) => {
    const all = await db.pg('user_group').orderBy('name', 'asc');
    return res.json({
        status: 'success',
        data: all
    })
});

router.get("/:user_email", async(req, res, next) => {
    const all = await db.pg('user_group')
    if (req.params.user_email.indexOf('@') > 0) {
        const user = await db.pg('usuario').where('email', req.params.user_email.split('=')[1])
        const userSelected = await db.pg('user_group')
            .whereIn('id', function() {
                return this.table('user_user_group').select('user_group_id').where('user_id', user[0].id)
            })
        return res.json({
            status: 'success',
            data: {
                all,
                user_selected: userSelected,
            },
        })
    } else {
        const result = await db.pg('user_group').where('id', req.params.user_email);
        return res.json({
            status: 'success',
            data: {
                user_selected: result,
                all,
            },
        })
    }
});

router.get("/:id", async(req, res, next) => {
    const data = await db.pg('user_group')
        .where('id', req.params.id)
    return res.json({
        status: 'success',
        data: data,
    })
});

router.get("/group/:id", async(req, res, next) => {
    //req.params.id
    const emp = await db.pg('employee').where('id', req.params.id);
    const value = await db.pg('user_user_group').where('user_id', emp[0].user_id);

    if (value != '') {
        const data = await db.pg('user_group').where('id', '=', value[0].user_group_id);
        return res.json({
            status: 'success',
            data: data,
        })
    } else {
        return res.json({
            status: 'sin grupo de usuario',
        })
    }

});

router.post("/", async(req, res, next) => {
    const status = await db.pg('user_group')
        .insert({
            name: req.body.name
        }).then(() => {
            return res.json({
                status: 'success',
            })
        })
});

router.post('/update', async(req, res, next) => {
    const status = await db.pg('user_group')
        .where('id', req.body.id)
        .update({
            name: req.body.name
        })
    if (status) {
        return res.json({
            status: 'success',
        })
    } else {
        return res.json({
            status: 'error',
        })
    }
})

router.post("/update-user-groups", async(req, res, next) => {
    //
})

module.exports = router;