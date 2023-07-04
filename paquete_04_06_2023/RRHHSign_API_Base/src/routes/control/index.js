var express = require("express");
var router = express.Router();
const db = require('../../modules/db/db');
require("dotenv-safe").load();
const pathToDestination = './control';
var aes256 = require('aes256');

router.get('/type-cert/:id', async (req, res, next) => {

    try {
        const data = await db.pg('employee as e')
            .select('e.cert_type')
            .where('e.email', req.params.id)

        return res.status(200).json({
            status: 'success',
            data: data
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            status: 'error',
            message: "Ocurrió un error, contácte con el administrador"
        })
    }
})

router.get('/pass-encrypt', function(req, res, next) {

    var password_encrypt = aes256.encrypt('itau', req.query.pass);
    console.log("contrasena encriptada: " + password_encrypt);

    return res.status(200).send({
        password: password_encrypt
    });

});

router.post('/pass-encrypt', function(req, res, next) {

    var password_encrypt = aes256.encrypt('itau', req.body.pass);
    console.log("contrasena encriptada: " + password_encrypt);

    return res.status(200).send({
        password: password_encrypt
    });

});

router.post('/pass-decrypt', function(req, res, next) {
    var password_decrypt = aes256.decrypt('itau', Buffer.from(req.body.pass, 'base64').toString('ascii'));

    return res.status(200).send({
        password: password_decrypt
    });

});

router.get('/pass-decrypt', function(req, res, next) {
    console.log("cifrado: " + req.query.pass);
    var password_decrypt = aes256.decrypt('itau', Buffer.from('P7bbgjQOh+v94UpVAqUa2w6GSy7/XCyGsA==', 'base64').toString('ascii'));

    return res.status(200).send({
        password: password_decrypt
    });

});

router.get("/", async function(req, res, next) {
    //Cargamos los valores para la empres, ver el token que retorna
    await db.pg('control').then((result) => {
        res.status(200).json({
            status: "success",
            data: result
        });
    })
});

router.get("/signning", async function(req, res, next) {
    await db.pg('type_sign').innerJoin('control_sign', 'sign_type', '=', 'type_sign.id').select('sign_name').then((result) => {
        res.status(200).json({
            status: "success",
            data: result
        });
    })
})

router.get("/equibalent", async function(req, res, next) {
    await db.pg('equibalencia_concepto_salario').count('id').then((result) => {
        if (result[0].count == '0') {
            res.status(200).json({
                status: "error",
                data: result
            });
        } else {
            res.status(200).json({
                status: "success",
                data: result
            });
        }
    });
});

router.put("/", async function(req, res, next) {
    //Guarda los registros de una empresa
});

router.post("/", async function(req, res, next) {
    //Genera un nuevo registro de empresa
    var data = req.body;
    var update = {};
    let keys = Object.keys(data);
    for (let key in keys) {
        if ((typeof data[keys[key]] === 'boolean') && (keys[key] !== 'id')) {
            update[keys[key]] = data[keys[key]];
        }
    }
    update['company'] = data['id'];
    const result = await db.pg('control').insert(update);
    if (result) {
        res.status(200).json({ success: result.rowCount })
    } else {
        res.status(415).json({ "error": "no se genero" })
    }
});

module.exports = router;