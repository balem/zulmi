var express = require('express');
var router = express.Router();
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

//authentication
router.post('/login', function (req, res, next) {
	if (utils.validateEmail(req.body.email) === false) {
		return res.status(400).json({
			status: "error",
			data: "E-mail is invalid"
		});
	}

	//Verifica se é um login de dev/suporte
	//return db.pg.select('*').table('usuario_dev').where('email', req.body.email)
		//.where('active', true)
		//.then(function (users) {
			//if (users.length === 0) {
				return db.pg.select('*').table('usuario').where('email', req.body.email)
					.where('active', true)
					.then(function (users) {
						if (users.length === 0) {
							return res.status(404).send('User not found!');
						} else {
							utils.comparePassword(req.body.password, users[0].password, function (err, result) {
								if (result === false) {
									return res.status(401).send("The provided password doesn't match");
								} else {
									const id = users[0].id;
									var token = jwt.sign({ id }, process.env.SECRET, {
										expiresIn: 300
									});
									var user = getUser(id, token);
									user.then((u) => {
										if (!u) {
											return res.status(404).send('User not found!');
										} else {
											return res.status(200).send({ auth: true, user: u, token: token });
										}
									});
								}
							});
						}
					});
			//} else {
				//return res.status(404).send('User not found!');
			//}
		//});
});

//token access
router.get('/access-token', function (req, res, next) {
	return utils.verifyJWT(req, res, (id) => {
		var user = getUser(id);
		user.then((u) => {
			if (!u) {
				return res.status(404).send('User not found!');
			} else {
				return res.status(200).send({ auth: true, user: u });
			}
		});
	});
});

function getUser(id) {
	return new Promise((resolve, reject) => {
		db.pg.select('usuario.id as user_id', 'name', 'email', 'user_profile.id as profile_id', 'profile_slug', 'change_pwd').table('usuario').join('user_profile', 'usuario.profile_id', '=', 'user_profile.id').where('usuario.id', id).then(function (users) {
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

//user registration
router.post('/register', async function (req, res, next) {

	if (utils.validateEmail(req.body.email) === false) {
		return res.status(500).json({
			status: "error",
			data: "E-mail is invalid"
		});
	}

	if (await utils.emailExists(req.body.email, 'usuario')) {
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
						return res.status(200).json({
							status: "success",
							data: users[0]
						});
					}).catch(function (e) {
						return res.status(500).json({
							status: "error",
							data: e.message
						});
					});
				}).catch(function (e) {
					return res.status(500).json({
						status: "error",
						data: e.message
					});
				});
		})
			.catch(function (e) {
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
		.join('user_profile', 'usuario.profile_id', 'user_profile.id')
		.where('usuario.email', req.query.email)

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
				'auditor',
				'funcionario',
			]
		} else if (user[0].profile_slug == 'rh') {
			slugs = [
				'rh_not_signer',
				'funcionario',
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