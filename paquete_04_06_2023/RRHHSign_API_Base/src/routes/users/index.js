var express = require('express');
var router = express.Router();
var aes256 = require('aes256');
var jwt = require('jsonwebtoken');
const db = require('../../modules/db/db');
require("dotenv-safe").load();
const utils = require('../../modules/utils');

function localization(req) {
    var local = (req.headers['localization'] || 'es-py');
    //search DB for the terms in the specified language for this API
    var json_com_todos_os_termos = { tudo_ok: 'tudo ok' };
    return json_com_todos_os_termos;
}

function verifyJWT(req, res, next) {
    utils.verifyJWT(req, res, next);
}

//default users route
router.get('/', verifyJWT, function (req, res, next) {
    var termos = localization(req);
    res.status(200).send({ mensagem: termos['tudo_ok'] });
});

router.post("/desactivate", async (req, res, next) => {

    await db.pg
        .table("usuario")
        .where("id", req.body.id)
        .update({
            active: req.body.active
        })
        .then(async () => {
            var usuario = await db.pg("usuario").where("id", req.body.id)

            if (req.body.active == 0) {
                var response = "Usuario desactivado exitósamente!";
                let message = 'Desactivacion de usuario ' + usuario[0].email + "/" + usuario[0].name;
                utils.insertLogs(req.body.creator, message, 'Acceso de Usuario', 'INFO');
            } else {
                let message = 'Activacion de usuario ' + usuario[0].email + "/" + usuario[0].name;
                utils.insertLogs(req.body.creator, message, 'Acceso de Usuario', 'INFO');
                var response = "Usuario activado exitósamente!";
            }

            return res.status(200).json({
                status: 'success',
                message: response
            })
        })
        .catch(e => {
            console.log('Users UPDATE ERR ', e)
            utils.insertLogs(req.body.creator, e.error, 'Acceso de Usuario', 'ERROR');
            return res.status(400).json({
                status: 'error',
                message: e.error
            })
        })
})

router.post('/save-profiles', async (req, res, next) => {

    try {
        let perfiles = req.body.perfiles
        let asignados = []

        await db.pg('usuario_perfiles').where('user_id', req.body.user_id).del()

        const user = await db.pg.table('usuario').where('id', req.body.user_id)
        for (let i = 0; i < perfiles.length; i++) {

            var perfil = await db.pg.table('user_profile', perfiles[i])
            asignados.push(perfil[i].profile_name)

            await db.pg.insert({
                user_id: req.body.user_id,
                profile_id: perfiles[i]
            }).table('usuario_perfiles')
        }

        utils.insertLogs(req.body.creator, 'Usuario: ' + user[0].email + ', Perfiles:' + asignados, 'Asignacion de perfiles', 'INFO');

        return res.status(200).json({
            status: "success"
        });


    } catch (error) {
        console.log(error)
        utils.insertLogs(req.body.creator, error, 'Asignacion de perfiles', 'ERROR');
        return res.status(200).json({
            status: "error",
            message: error
        });
    }
})

router.post('/getUsuariosPerfiles', async (req, res, next) => {

    try {
        var usuarios_perfiles = await db.pg.table('usuario_perfiles').where('user_id', req.body.id)
        var perfiles = await db.pg.table('user_profile')
        let data = []
        let check = []

        for (let i = 0; i < perfiles.length; i++) {
            var cont = 0
            for (let x = 0; x < usuarios_perfiles.length; x++) {
                if (perfiles[i].id == usuarios_perfiles[x].profile_id) {
                    data.push({
                        id: perfiles[i].id,
                        profile_name: perfiles[i].profile_name,
                        check: true
                    })
                    check.push(perfiles[i].id)
                    cont++
                }
            }

            if (cont == 0) {
                data.push({
                    id: perfiles[i].id,
                    profile_name: perfiles[i].profile_name,
                    check: false
                })
            }

        }

        return res.status(200).json({
            status: "success",
            data: {
                checked: check,
                usuarios_perfiles: data
            }
        });


    } catch (error) {
        console.log(error)
        return res.status(200).json({
            status: "error",
            message: error
        });
    }


})

router.get('/user-profiles', async (req, res, next) => {
    const data = await db.pg('user_profile')
        .orderBy('profile_name', 'asc');
    res.json({
        status: 'success',
        data: data
    })
})

router.get("/search/:id", async (req, res, next) => {
    const data = await db.pg('usuario')
        .where('id', req.params.id)

    const perfiles = await db.pg('usuario_perfiles')
        .select('profile_slug')
        .join('user_profile', 'user_profile.id', 'usuario_perfiles.profile_id')
        .where('user_id', req.params.id)

    return res.json({
        status: 'success',
        usuario: data,
        profiles: perfiles
    })
});

router.get('/user-list', async (req, res, next) => {
    const data = await db.pg('usuario')
        .orderBy('name', 'asc');
    res.json({
        status: 'success',
        data: data
    })
})

router.get('/profile', function (req, res, next) {
    db.pg.select('*').table('usuario').where('email', req.query.email.toLowerCase())
        .where('active', true)
        .then(function (users) {
            if (users.length>0) {
                db.pg.select('user_profile.profile_slug', 'user_profile.profile_name', 'usuario.email').table('usuario_perfiles')
                .join('usuario', 'usuario.id', 'usuario_perfiles.user_id')
                .join("user_profile", "user_profile.id", "usuario_perfiles.profile_id")
                .where('user_id', users[0].id).then(function (values) {
                    return res.status(200).send({ perfiles: values });
                })
            } else {
                return res.status(200).send({ perfiles: [] });
            }
           
        })
});

//authentication
/*router.post('/login', function(req, res, next) {
    var key = db.pg.select('ruc', 'razon_social').table('company').then(function(values) {
        var key = values[0]['ruc'] + values[0]['razon_social'];
        var value = req.body.email;
        var email = value;
        value = req.body.password;
        var pass = value;
        utils.insertLogs(email, 'Acceso al sistema ' + email);
        if (email.indexOf('@') > 0) {
            if (utils.validateEmail(email) === false) {
                return res.status(400).json({
                    status: "error",
                    data: "E-mail is invalid"
                });
            }

            return db.pg.select('*').table('usuario').where('email', email.toLowerCase())
                .where('active', true)
                .then(function(users) {
                    if (users.length === 0) {
                        return res.status(404).send('User not found!');
                    } else {
                        utils.comparePassword(pass.replace(/ /g, ''), users[0].password, function(err, result) {
                            if (result === false) {
                                utils.insertLogs(email, 'Contraseña invalida ' + email);
                                return res.status(401).send("The provided password doesn't match");
                            } else {
                                const id = users[0].id;
                                var token = jwt.sign({ id }, process.env.SECRET, {
                                    expiresIn: 300
                                });
                                var user = getUser(id, token);
                                user.then((u) => {
                                    if (!u) {
                                        utils.insertLogs(email, 'Error de acceso: usuario no existe ' + email);
                                        return res.status(404).send('User not found!');
                                    } else {
                                        return res.status(200).send({ auth: true, user: u, token: token });
                                    }
                                });
                            }
                        });
                    }
                });
        } else {
            return db.pg.select('user_id').table('employee').where('email', email.toLowerCase()).then(function(employee) {

                db.pg.select('*').table('usuario').where('id', employee[0].user_id)
                    .where('active', true)
                    .then(function(users) {

                        if (users.length === 0) {
                            return res.status(404).send('User not found!');
                        } else {
                            utils.comparePassword(pass.replace(/ /g, ''), users[0].password, function(err, result) {
                                if (result === false) {
                                    utils.insertLogs(users[0].email, 'Contraseña invalida ' + email);
                                    return res.status(401).send("The provided password doesn't match");
                                } else {
                                    const id = users[0].id;
                                    var token = jwt.sign({ id }, process.env.SECRET, {
                                        expiresIn: 300
                                    });
                                    var user = getUser(id, token);
                                    user.then((u) => {
                                        if (!u) {
                                            utils.insertLogs(email, 'Error de acceso: usuario no existe ' + email);
                                            return res.status(404).send('User not found!');
                                        } else {
                                            return res.status(200).send({ auth: true, user: u, token: token });
                                        }
                                    });
                                }
                            });
                        }
                    });
            })
        }
    });
});*/

//authentication 2
router.post('/loginemail', function (req, res, next) {
    console.log(req.body)
    var key = db.pg.select('ruc', 'razon_social').table('company').then(function (values) {
        var key = values[0]['ruc'] + values[0]['razon_social'];
        var value = req.body.email;
        var perfil = req.body.perfil;
        var email = aes256.decrypt(key, value);
        utils.insertLogs(email, 'Acceso al sistema ' + email, 'Inicio Sesión', 'INFO');
        if (email.indexOf('@') > 0) {
            if (utils.validateEmail(email) === false) {
                return res.status(400).json({
                    status: "error",
                    data: "E-mail is invalid"
                });
            }

            return db.pg.select('*').table('usuario').where('email', email.toLowerCase())
                .where('active', true)
                .then(function (users) {
                    if (users.length === 0) {
                        return res.status(404).send('User not found!');
                    } else {

                        const id = users[0].id;
                        var token = jwt.sign({ id, perfil }, process.env.SECRET);
                        //console.log("nuevo token: " + token)

                        var user = getUser(id, perfil);
                        user.then((u) => {
                            if (!u) {
                                utils.insertLogs(email, 'Error de acceso: usuario no existe ' + email, 'Inicio Sesión', 'WARNING');
                                return res.status(404).send('User not found!');
                            } else {
                                return res.status(200).send({ auth: true, user: u, token: token });
                            }
                        });
                    }
                });
        }
    });
});

//token access
router.get('/access-token', function (req, res, next) {
    return utils.verifyJWT(req, res, (id, perfil, token) => {
        //console.log("id: " + id + '/perfil: ' + perfil + '/token: ' + token)
        var user = getUser(id, perfil);
        user.then((u) => {
            if (!u) {
                return res.status(404).send('User not found!');
            } else {
                return res.status(200).send({ auth: true, user: u, token: token });
            }
        });
    });
});

function getUser(id, perfil) {
    return new Promise((resolve, reject) => {
        db.pg.select('usuario.id as user_id', 'name', 'email', 'usuario_perfiles.profile_id as profile_id', 'user_profile.profile_slug',
            'change_pwd', 'control.mostrar_meses')
            .table('usuario')
            .join('usuario_perfiles', 'usuario.id', '=', 'usuario_perfiles.user_id')
            .join('user_profile', 'usuario_perfiles.profile_id', '=', 'user_profile.id')
            .join('control', 'control.id', '=', 'control.id')
            .where('usuario.id', id)
            .where('user_profile.profile_slug', perfil)
            .then(function (users) {
                if (users.length === 0) {
                    reject(false);
                } else {
                    var user = {
                        role: [users[0].profile_slug],
                        data: {
                            'displayName': users[0].name,
                            //'photoURL'   : 'assets/images/avatars/'+users[0].avatar,
                            'email': users[0].email,
                            'changePwd': users[0].change_pwd,
                            'mostrar': users[0].mostrar_meses,
                            shortcuts: [
                                'calendar',
                                'mail',
                                'contacts',
                                'todo'
                            ]
                        }
                    };
                    resolve(user);
                }
            });
    });
}

router.post('/check-change-pwd', async (req, res, next) => {
    const data = await db.pg('usuario')
        .select(
            'change_pwd'
        )
        .where('email', req.body.email)
    return res.json({
        data: data[0]
    })
})

//user registration
router.post('/register', async function (req, res, next) {
    if (utils.validateEmail(req.body.email) === false) {
        utils.insertLogs(req.body.email, 'Registro invalido ' + req.body.email);
        return res.status(500).json({
            status: "error",
            data: "E-mail is invalid"
        });
    }
    if (await utils.emailExists(req.body.email, 'usuario')) {
        utils.insertLogs(req.body.email, 'Usuario existe, reintento de registro ' + req.body.email);
        return res.status(400).json({
            status: "error",
            data: "E-mail already exists"
        });
    }
    let avatar = '';
    if (req.body.avatar !== undefined) {
        avatar = req.body.avatar;
    }
    var query = db.pg.select('user_profile.*').table('user_profile').where('profile_slug', req.body.profile || 'funcionario');
    utils.cryptPassword(req.body.password, (err, hash) => {
        query.then(function (profiles) {
            db.pg.insert({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                avatar: avatar,
                profile_id: profiles[0]['id'],
                change_pwd: true,
            })
                .table('usuario')
                .then(() => {
                    db.pg.select('usuario.id').table('usuario').where('email', req.body.email).then((users) => {
                        utils.insertLogs(req.body.email, 'Usuario creado ' + req.body.email);
                        return res.status(200).json({
                            status: "success",
                            data: users[0]
                        });
                    }).catch(function (e) {
                        utils.insertLogs(req.body.email, 'Error creando usuario ' + e.message);
                        return res.status(500).json({
                            status: "error",
                            data: e.message
                        });
                    });
                }).catch(function (e) {
                    utils.insertLogs(req.body.email, 'Error creando usuario ' + e.message);
                    return res.status(500).json({
                        status: "error",
                        data: e.message
                    });
                });
        })
            .catch(function (e) {
                utils.insertLogs(req.body.email, 'Error creando usuario ' + e.message);
                return res.status(500).json({
                    status: "error",
                    data: e.message
                });
            });
    });
});

//forgot my password
router.post('/forgot-password', async function (req, res, next) {
    if (utils.validateEmail(req.body.email) === false) {
        return res.status(500).json({
            status: "error",
            data: "E-mail is invalid"
        });
    }

    if (await utils.emailExists(req.body.email, 'users')) {
        utils.insertLogs(req.body.email, 'Password perdido ' + req.body.email);
        return db.pg.select('*').table('usuario').where('email', req.body.email).then(function (users) {
            if (users.length === 0) {
                return res.status(404).send('User not found!');
            } else {
                //SEND EMAIL MODE #1
                /*let email = { 
                    senderName: 'Sender MagmaIT',
                    senderEmail: 'sender@magmait.com.br',
                    to: 'andre@magmait.com.br',
                    subject: 'TESTE',
                    plainText: 'TESTE',
                    html: '<h1>Teste</h1>'
                };
                utils.sendEmail(email);*/

                //SEND EMAIL MODE #2
                let email2 = {
                    from: 'sender@magmait.com.br',
                    to: 'andre@magmait.com.br',
                    toName: 'André Luiz dos Santos',
                    template: 'reset-password',
                    subject: 'Teste sendEmail2'
                };
                return axios.post('https://dataflow.code100sa.com.py/api/email/send', email)
                    .then(() => res.status(200).send({ message: 'Email enviado' }))
                // utils.sendMail2(email2);
                // return res.status(200).send({ message: 'Email enviado' });
            }
        });
    }

});

router.post('/change-password', async (req, res, next) => {
    utils.insertLogs(req.body.email, 'Cambio de password ' + req.body.email);
    utils.cryptPassword(req.body.password, async (err, password) => {
        await db.pg('usuario')
            .where('email', req.body.email)
            .update({
                password,
                change_pwd: false,
            })
            .then(() => {
                return res.json({
                    status: 'success',
                    data: 'Contraseña actualizada con éxito',
                })
            })
            .catch(e => {
                console.log('ERROR changing password: ', e)
                return res.json({
                    status: 'error',
                })
            })
    })
})

router.get("/user-types", async (req, res, next) => {
    const user = await db.pg('usuario')
        .select('profile_slug')
        .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
        .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
        .where('usuario.email', req.query.email)
        .where("user_profile.profile_slug", req.query.perfil)
    console.log('slug', user[0].profile_slug)

    let query = db.pg('user_profile')
        .select('id', 'profile_name')

    if (user.length > 0) {
        let slugs = []
        if (user[0].profile_slug == 'master') {
            slugs = [
                'master',
                'rh',
                'director',
                'funcionario',
            ]
        } else if (user[0].profile_slug == 'rh') {
            slugs = [
                'rh_not_signer',
                'funcionario',
                'master',
                'rh',
                'director',
            ]
        }
        query = query.whereIn('profile_slug', slugs)
    }

    query
        .then((types) => {
            if (types) {
                return res.status(200).json({
                    status: "success",
                    data: types
                })
            } else {
                return res.status(200).json({
                    status: "error",
                    data: types
                })
            }
        })
        .catch(e => {
            return res.status(200).json({
                status: "error",
                data: e
            })
        })
})

//delete user
router.delete("/del", async function (req, res, next) {
    let user = await db.pg('user').where({ id: req.body.id }).select('email');
    utils.insertLogs(user[0].email, 'Borrar usuario ' + user[0].email);
    db.pg('usuario').where('id', req.body.id).del().then(() => {
        return res.status(200).json({
            status: "success",
            data: "User deleted with success"
        });
    }).catch((e) => {
        return res.status(500).json({
            status: "error",
            data: e.message
        });
    });
});
module.exports = router;