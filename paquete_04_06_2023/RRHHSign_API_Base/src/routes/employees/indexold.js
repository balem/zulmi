var express = require("express");
var router = express.Router();
const db = require("../../modules/db/db");
const utils = require("../../modules/utils");
const { IncomingForm } = require("formidable");
const XLSX = require('xlsx');
const fs = require('fs');
var moment = require("moment");
require("dotenv-safe").load();
var JSZip = require("jszip");
var cron = require('node-cron');

cron.schedule('*/3 * * * * *', async () => {
    var employee = await db.pg.table('employee').select('email', 'nombres', 'apellidos').where('send_mail', false)
    .orderBy('created_at', 'asc')

    if (employee.length > 0) {

        await db.pg.table('employee')
            .update({
                send_mail: true
            }).where('email', employee[0].email)

        let emailData = {
            email: employee[0].email,
            nombres: employee[0].nombres,
            apellidos: employee[0].apellidos,
            password: null,
        }

        let emailResponse = await EnviaEmailPassword(emailData);
        if (emailResponse) {

            if (emailResponse.status == 'success') {
                console.log("Correo electrónico enviado")
            } else {
                const user = await db.pg('usuario')
                .join('usuario_perfiles', 'usuario_perfiles.user_id', 'usuario.id')
                .join('user_profile', 'user_profile.id', 'usuario_perfiles.profile_id')
                .select('usuario.name', 'usuario.email')
                .where('user_profile.profile_slug', 'rh')

                utils.insertLogs(user[0].email, emailResponse.message + ', Email:' + employee[0].email, 'Alta masiva de empleado', 'ERROR');
                console.log("No se pudo enviar el correo")
            }
        }

    }
});


//GET EMPLOYEES
router.get("/", async function (req, res, next) {
    await db.pg
        .select("usuario.active", "employee.apellidos", "employee.cargo", "employee.cert_type", "employee.cert_added", "employee.cert_correct", "employee.cert_date", "employee.cert_end", "employee.cert_start", "usuario.change_pwd", "employee.contrato", "employee.created_at", "employee.departamento", "employee.email", "employee.fecha_ingresso", "employee.firma_holografa", "employee.id", "employee.identification", "employee.ips_empleado", "employee.legajo", "employee.modified_at", "employee.mtess_patronal", "usuario.name", "employee.nombres", "usuario.password", "usuario.profile_id", "employee.sueldo_jornal", "employee.telefono", "employee.user_id")
        .table("usuario")
        .join("employee", "employee.user_id", "usuario.id")
        .orderBy("employee.nombres")
        .then(function (employees) {
            if (employees.length === 0) {
                return res.status(200).json({
                    status: "error",
                    data: "Empleados no encontrados"
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    data: employees
                });
            }
        });
});

router.post("/add", async function (req, res, next) {
    let data = req.body;

    return await db.pg
        .select("user_profile.*")
        .table("user_profile")
        .where("profile_slug", "funcionario")
        .then(async profiles => {
            await db.pg
                .select("usuario.*")
                .table("usuario")
                .join("employee", "usuario.id", "employee.user_id")
                .where("employee.email", data.email)
                .orWhere("employee.identification", data.identification)
                .then(async users => {
                    if (users.length > 0) {
                        console.log("Empleado ya registrado");
                        let message = 'Ya esta registrado: ' + data.identification + "/" + data.email;
                        utils.insertLogs(data.creator, message, 'Alta individual de empleado', 'WARNING');
                        return res.status(200).json({
                            status: "error",
                            data: "El email y/o ci ya existe"
                        });
                    } else {
                        await db.pg
                            .select('mtess_patronal')
                            .table('patronal')
                            .where('mtess_patronal', data.nromtesspatronal)
                            .then(async mtess => {
                                if (mtess.length == 0) {
                                    console.log("MTESS Patronal no registrado");
                                    let message = 'MTESS Patronal no registrado: ' + data.nromtesspatronal;
                                    utils.insertLogs(data.creator, message, 'Alta individual de empleado', 'WARNING');
                                    return res.status(200).json({
                                        status: "error",
                                        data: "MTESS Patronal no registrado"
                                    });
                                } else {
                                    await db.pg
                                        .insert({
                                            name: data.nombres + ' ' + data.apellidos,
                                            email: data.email,
                                            password: null,
                                            profile_id: profiles[0].id,
                                            change_pwd: false,
                                        })
                                        .table("usuario")
                                        .then(async () => {
                                            await db.pg
                                                .select("usuario.*")
                                                .table("usuario")
                                                .where("email", "=", data.email || '')
                                                .then(async users => {

                                                    let message = 'Registro creado: ' + data.identification + "/" + data.email;
                                                    utils.insertLogs(data.creator, message, 'Alta individual de empleado', 'INFO');

                                                    await db.pg('usuario_perfiles')
                                                        .insert({
                                                            user_id: users[0].id,
                                                            profile_id: profiles[0].id,
                                                        });

                                                    if ((data.departamento) && (data.departamento != '')) {
                                                        var depart = await db.pg('departamentos').where('desc_departamento', '=', data.departamento).select('id');
                                                    }

                                                    if ((data.cargo) && (data.cargo != '')) {
                                                        var cargo = await db.pg('cargos').where('desc_cargo', '=', data.cargo).select('id');
                                                    }

                                                    await db.pg
                                                        .insert({
                                                            nombres: data.nombres,
                                                            apellidos: data.apellidos,
                                                            sueldo_jornal: data.sueldo_jornal,
                                                            ips_empleado: null, //data.ips_empleado,
                                                            fecha_ingresso: null, //data.fecha_ingreso,
                                                            email: data.email.toLowerCase(),
                                                            identification: data.identification,
                                                            contrato: data.contrato,
                                                            user_id: users[0].id,
                                                            legajo: data.legajo,
                                                            cargo: cargo[0].id,
                                                            mtess_patronal: data.nromtesspatronal,
                                                            departamento: depart[0].id,
                                                            number_count: data.account_number,
                                                            nro_padron: data.nro_padron,
                                                            send_mail: true
                                                        })
                                                        .table("employee")
                                                        .then(async () => {

                                                            if ((data.sucursal) && (data.sucursal != '')) {
                                                                var userId = await db.pg('usuario').where('email', '=', data.email).select('id');
                                                                var grouId = await db.pg('user_group').where('name', '=', data.sucursal).select('id');

                                                                await db.pg('user_user_group').insert({
                                                                    user_id: userId[0].id,
                                                                    user_group_id: grouId[0].id
                                                                }).catch(e => {
                                                                    return res.status(200).json({
                                                                        status: "error",
                                                                        data: "Grupo no insertado"
                                                                    });
                                                                });
                                                            }

                                                            let emailData = {
                                                                email: data.email,
                                                                nombres: data.nombres,
                                                                apellidos: data.apellidos,
                                                                password: null,
                                                            }

                                                            let emailResponse = await EnviaEmailPassword(emailData);
                                                            console.log(emailResponse)

                                                            if (emailResponse.status == 'success') {
                                                                return res.status(200).json({
                                                                    status: "success",
                                                                    data: "Correo electrónico enviado!"
                                                                });
                                                            } else {
                                                                utils.insertLogs(data.creator, emailResponse.message + ', Email:' + data.email, 'Alta individual de empleado: envio de correo', 'ERROR');
                                                                return res.status(200).json({
                                                                    status: "error",
                                                                    data: "No se pudo enviar el correo electrónico!"
                                                                });
                                                            }

                                                        })
                                                        .catch(function (e) {
                                                            console.error('ERROR: ', e);
                                                        });

                                                })
                                                .catch(function (e) {
                                                    return res.status(400).json({
                                                        status: "error",
                                                        data: "Error general al buscar usuario"
                                                    });
                                                });
                                        })
                                        .catch(function (e) {
                                            return res.status(400).json({
                                                status: "error",
                                                data: "No se puede agregar usuario"
                                            });
                                        });
                                }
                            })
                            .catch(function (e) {
                                console.log('Error retrieving user profile: ', e)
                                return res.status(400).json({
                                    status: "Error retrieving user profile",
                                    data: "Error retrieving user profile " + e.message
                                });
                            });
                    }
                })
                .catch(e => {
                    console.log('Error retrieving user profile: ', e)
                    return res.status(400).json({
                        status: "Error retrieving user profile",
                        data: "Error retrieving user profile " + e.message
                    });
                });

        });
});

router.post('/add-multiple', async (req, res, next) => {
    var form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
        var workbook = XLSX.read(files.file.path, { type: 'file', bookType: "xlss" });
        var sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        var id_profile = '';
        let errores = 0
        let message = "Registros para procesar: " + sheet.length;
        utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'INFO');

        await db.pg.select('id')
            .from('user_profile')
            .where('profile_slug', '=', "funcionario")
            .then(async profiles => {
                id_profile = profiles[0].id;
            })

        sheet.forEach(async data => {

            if (data.fecha_ingreso == undefined) {
                var fecha_ingreso = null;
            } else {
                var fecha_ingreso = moment(data.fecha_ingreso, 'DD/MM/YYYY').format('YYYY-MM-DD')
            }

            try {
                var users = await db.pg.select("usuario.*").table("usuario")
                    .join("employee", "usuario.id", "employee.user_id")
                    .where("employee.email", '=', data.email)
                    .orWhere("employee.identification", '=', data.cedula)

                if (users.length > 0) {
                    errores++
                    console.log('empleado ya registrado')
                    let message = 'Empleado ya registrado: ' + data.cedula + "/" + data.email;
                    utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'WARNING');
                } else {
                    if (data.nromtesspatronal) {
                        var mtess = await db.pg.select('mtess_patronal').table('patronal')
                            .where('mtess_patronal', data.nromtesspatronal)

                        if (mtess.length == 0) {
                            errores++
                            let message = 'No se puede agregar el empleado, MTESS Patronal no registrado: ' + data.nromtesspatronal;
                            utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'WARNING');
                        } else {

                            if (utils.validateEmail(data.email) === false) {
                                errores++
                                let message = 'No se puede agregar el empleado, email no válido: ' + data.email;
                                utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'WARNING');
                            } else {
                                var users = await db.pg.table('usuario')
                                    .insert({
                                        name: data.nombres + ' ' + data.apellidos,
                                        email: data.email,
                                        password: null,
                                        profile_id: id_profile,
                                        change_pwd: false,
                                    }).returning('id')

                                await db.pg('usuario_perfiles')
                                    .insert({
                                        user_id: users[0],
                                        profile_id: id_profile,
                                    });

                                if ((data.sucursal) && (data.sucursal != '')) {
                                    var grouId = await db.pg('user_group').where('name', '=', data.sucursal).select('id');

                                    if (grouId.length > 0) {

                                        await db.pg('user_user_group').insert({
                                            user_id: users[0],
                                            user_group_id: grouId[0].id
                                        });

                                    } else {
                                        errores++
                                        let message = 'No existe la sucursal: "' + data.sucursal + '" para asignar al empleado: ' + data.nombres + " " + data.apellidos;
                                        utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'WARNING');
                                    }

                                }


                                if ((data.departamento) && (data.departamento != '')) {
                                    var depart = await db.pg('departamentos').where('desc_departamento', '=', data.departamento).select('id');
                                    if (depart.length == 0) {
                                        errores++
                                        console.log("No se puede agregar empleado, no existe el departamento: " + data.departamento)
                                        let message = "No se puede agregar el empleado, no existe el departamento: " + data.departamento;
                                        utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'WARNING');
                                        await db.pg.delete().table('usuario_perfiles').where('user_id', users[0]).then(async () => {
                                            await db.pg.delete().table('usuario').where('id', users[0]).then(() => { });
                                        });
                                    }
                                }

                                if ((data.cargo) && (data.cargo != '')) {
                                    var cargo = await db.pg('cargos').where('desc_cargo', '=', data.cargo).select('id');
                                    if (cargo.length == 0) {
                                        errores++
                                        console.log("No se puede agregar empleado, no existe el cargo: " + data.cargo)
                                        let message = "No se puede agregar el empleado, no existe el cargo: " + data.cargo;
                                        utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'WARNING');
                                        await db.pg.delete().table('usuario_perfiles').where('user_id', users[0]).then(async () => {
                                            await db.pg.delete().table('usuario').where('id', users[0]).then(() => { });
                                        });
                                    }
                                }

                                if (cargo.length > 0 && depart.length > 0) {
                                    await db.pg.table('employee')
                                        .insert({
                                            nombres: data.nombres,
                                            apellidos: data.apellidos,
                                            sueldo_jornal: data.sueldoJornal,
                                            ips_empleado: null, //data.ips_empleado,
                                            fecha_ingresso: fecha_ingreso,
                                            email: data.email,
                                            identification: data.cedula,
                                            contrato: data.contrato,
                                            user_id: users[0],
                                            legajo: data.legajo,
                                            cargo: cargo[0].id,
                                            mtess_patronal: data.nromtesspatronal,
                                            departamento: depart[0].id,
                                            number_count: data.numero_cuenta,
                                            nro_padron: data.numero_padron,
                                            send_mail: false
                                        })
                                }
                            }
                        }
                    } else {
                        console.log("No se puede agregar el empleado, MTESS Patronal no definido para: " + data.nombres + " " + data.apellidos);
                        let message = 'No se puede agregar el empleado, MTESS Patronal no definido para: ' + data.nombres + " " + data.apellidos;
                        utils.insertLogs(fields.creator, message, 'Alta masiva de empleados', 'WARNING');
                    }
                }

            } catch (error) {
                console.error(error);
                errores++
                utils.insertLogs(fields.creator, error, 'Alta masiva de empleados', 'ERROR');
            }

            if (errores > 0) {
                return res.json({
                    status: "error",
                    message: 'La carga finalizo con algunos errores, verifique el log de acciones'
                });
            } else {
                return res.json({
                    status: "success",
                    message: 'Documento procesado exitosamente'
                });
            }

        })

    })
})

router.put("/register", async function (req, res, next) {
    if (utils.validateEmail(req.body.email) === false) {
        console.log("E-mail is invalid");
        return res.status(400).json({
            status: "error",
            data: "E-mail is invalid"
        });
    }

    if (await utils.emailExists(req.body.email, "agent", req.body.id)) {
        console.log("E-mail already exists");
        return res.status(400).json({
            status: "error",
            data: "E-mail already exists"
        });
    }

    db.pg
        .table("agent")
        .where("id", "=", req.body.id)
        .update({
            name: req.body.name,
            email: req.body.email,
            identification: req.body.identification,
            sex: req.body.sex === "M" ? "Masculino" : "Feminino",
            birthday: req.body.birthday
        })
        .then(() => {
            db.pg
                .select("agent.*")
                .table("agent")
                .where("email", req.body.email)
                .then(agents => {
                    return res.status(200).json({
                        status: "success",
                        data: agents[0]
                    });
                })
                .catch(function (e) {
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


router.post("/desactivate", async (req, res, next) => {
    const company = await db.pg('company')

    await db.pg
        .table("usuario")
        .join('employee', 'employee.user_id', 'usuario.id')
        .where("employee.id", "=", req.body.id)
        .update({
            active: req.body.active
        })
        .then(async () => {

            var employee = await db.pg("employee")
                .select('nombres', 'apellidos', 'email', 'identification')
                .where("id", req.body.id)

            if (req.body.active == 0) {
                var status = "Desactivacion";
                var response = "Empleado desactivado exitósamente!";

                const baseDir = `./openssl/certificates/empresa-${company[0].ruc}/ci-${employee[0].identification}`

                let files = [];
                if (fs.existsSync(baseDir)) {
                    files = fs.readdirSync(baseDir);
                    files.forEach(function (file, index) {
                        let curPath = baseDir + "/" + file;
                        if (fs.statSync(curPath).isDirectory()) {
                            deleteFolder(curPath);
                        } else {
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(baseDir);
                    let message = "Certificado eliminado: " + baseDir
                    utils.insertLogs(req.body.creator, message, 'Desactivacion de usuario', 'INFO');
                } else {
                    let message = "No existe un certificado importado para eliminar"
                    utils.insertLogs(req.body.creator, message, 'Desactivacion de usuario', 'WARNING');
                }

            } else {
                var status = "Activacion";
                var response = "Empleado activado exitósamente!";
            }
            let message = employee[0].email + "/" + employee[0].nombres + ' ' + employee[0].apellidos;
            utils.insertLogs(req.body.creator, message, status + " de usuario", 'INFO');
            return res.status(200).json({
                status: 'success',
                message: response
            })
        })
        .catch(e => {
            console.log('EMPLOYEE UPDATE ERR ', e)
            return res.status(400).json({
                status: 'error',
                data: e
            })
        })
})

router.post("/update", async (req, res, next) => {
    /*const password = utils.simpleRandomHash(10)
    const cryptedPassword = utils.cryptPasswordSync(password)*/

    let employeeUpdatedData = {}

    if (req.body.nombres) {
        employeeUpdatedData['nombres'] = req.body.nombres
    }
    if (req.body.apellidos) {
        employeeUpdatedData['apellidos'] = req.body.apellidos
    }
    if (req.body.sueldo_jornal) {
        employeeUpdatedData['sueldo_jornal'] = req.body.sueldo_jornal
    }
    /*if (req.body.ips_empleado) {
        employeeUpdatedData['ips_empleado'] = req.body.ips_empleado
    }*/
    if (req.body.email) {
        employeeUpdatedData['email'] = req.body.email
    }
    if (req.body.identification) {
        employeeUpdatedData['identification'] = req.body.identification
    }
    if (req.body.contrato) {
        employeeUpdatedData['contrato'] = req.body.contrato
    }
    if (req.body.account_number) {
        employeeUpdatedData['number_count'] = req.body.account_number;
    }
    if (req.body.departamento) {
        var depart = await db.pg('departamentos').where('desc_departamento', '=', req.body.departamento).select('id');
        await db.pg
            .table("employee")
            .where("id", "=", req.body.id)
            .update({
                departamento: depart[0].id,
            })
    }
    if (req.body.cargo) {
        var cargo = await db.pg('cargos').where('desc_cargo', '=', req.body.cargo).select('id');
        await db.pg
            .table("employee")
            .where("id", "=", req.body.id)
            .update({
                cargo: cargo[0].id
            })
    }
    if (req.body.legajo) {
        employeeUpdatedData['legajo'] = req.body.legajo;
    }
    if (req.body.nro_padron) {
        employeeUpdatedData['nro_padron'] = req.body.nro_padron;
    }
    if (req.body.mtess_patronal) {
        employeeUpdatedData['mtess_patronal'] = req.body.mtess_patronal;
    }
    let data = 'Nombres: ' + employeeUpdatedData['nombres'] + ', ' + 'Apellidos: ' + employeeUpdatedData['apellidos'] + ', ' + 'Cargo: ' + req.body.cargo + ', ' + 'Departamento: ' + req.body.departamento + ', ' + 'Sueldo Jornal: ' + employeeUpdatedData['sueldo_jornal'] + ', ' + 'Email: ' + employeeUpdatedData['email'] + ', ' + 'Cedula: ' + employeeUpdatedData['identification'] + ', ' + 'Contrato: ' + employeeUpdatedData['contrato'] + ', ' + 'Padron: ' + employeeUpdatedData['nro_padron'] + ', ' + 'Patronal: ' + employeeUpdatedData['mtess_patronal'] + ', ' + 'Cuenta Bancaria: ' + employeeUpdatedData['number_count'];
    utils.insertLogs(req.body.creator, data, 'Actualizacion de datos de usuario', 'INFO');
    (
        Object.keys(employeeUpdatedData).length > 0 ?
            db.pg("employee")
                .where("id", req.body.id)
                .update(employeeUpdatedData) :
            new Promise((resolve, reject) => resolve(true))
    )
        .then(() => {
            let updatedData = {
                change_pwd: false,
            }

            if (req.body.nombres) {
                updatedData['name'] = req.body.nombres + ' ' + req.body.apellidos
            }
            if (req.body.email) {
                updatedData['email'] = req.body.email
            }

            return Object.keys(updatedData).length > 0 ?
                db.pg('usuario')
                    .whereIn('id', function () { return this.select('user_id').from('employee').where('id', req.body.id) })
                    .update(updatedData) :
                new Promise((resolve, reject) => resolve(true))
        })
        .then(async () => {
            const employee = await db.pg("employee")
                .select('user_id')
                .where("id", req.body.id)

            await db.pg('user_user_group').where('user_id', employee[0].user_id).delete()

            if ((req.body.sucursal) && (req.body.sucursal.length > 0)) {
                //var userId = req.body.id;
                var userId = employee[0].user_id;
                var grouId = await db.pg('user_group').where('name', '=', req.body.sucursal).select('id');
                db.pg('user_user_group').insert({
                    user_id: userId,
                    user_group_id: grouId[0].id
                }).catch(e => {
                    console.error('ERROR: ', e);
                });
            }
            return true
        })
        .then(() => {
            /*if (req.body.active == undefined) {
                let emailData = {
                    email: req.body.email,
                    nombres: req.body.nombres,
                    apellidos: req.body.apellidos,
                    password: password,
                }

                return EnviaEmailPassword(emailData);
            }*/
            return null
        })
        .then(() => {
            return res.status(200).json({
                status: 'success'
            })
        })
        .catch(e => {
            console.log('EMPLOYEE UPDATE ERR ', e)
            return res.status(200).json({
                status: 'error',
                data: e
            })
        })
})

//DELETE EMPLOYEE (AND HIS USER)
router.delete("/del", async function (req, res, next) {

    let id = req.query.id;
    db.pg("employee")
        .where(`${ownerType}_id`, id)
        .del()
        .then(() => {
            db
                .pg("phone")
                .where(`${ownerType}_id`, id)
                .del()
                .then(async () => {
                    let agentResponse = await db.pg
                        .select("*")
                        .table("agent")
                        .where("id", id);
                    let agent = Promise.resolve(agentResponse);
                    console.log("AGENT: " + agent);
                    db
                        .pg("agent")
                        .where("id", id)
                        .del()
                        .then(() => {
                            return res.status(200).json({
                                status: "success",
                                data: "Agent deleted with success"
                            });
                        })
                        .catch(e => {
                            return res.status(200).json({
                                status: "error",
                                data: e.message
                            });
                        });
                })
                .catch(e => {
                    return res.status(200).json({
                        status: "error",
                        data: e.message
                    });
                });
        })
        .catch(e => {
            return res.status(200).json({
                status: "error",
                data: e.message
            });
        });
});

router.post('/upload-holographic-signature', async (req, res, next) => {
    var form = new IncomingForm();

    return form.parse(req, (err, fields, files) => {
        let timestamp = Date.now();
        let oldpath = files.file.path;
        let extension = files.file.name.split('.').pop();

        let newpath = `holographic-signatures/${utils.simpleRandomHash(10)}_${timestamp}.${extension}`;

        fs.copyFile(oldpath, `./src/public/${newpath}`, async (err) => {
            if (err) {
                console.log('Error sending holographic signature: ', err)
                res.send({ status: 'error', message: 'Invalid information sent to the API' });
                return;
            }

            await db.pg('employee')
                .where('id', fields.id)
                .update({
                    firma_holografa: newpath
                })

            return res.status(200).json({
                status: 'success',
                data: 'File uploaded with success',
            });
        });

    });
})

router.post('/upload-holographic-signature-one', async (req, res, next) => {
    var form = new IncomingForm();

    return form.parse(req, async (err, fields, files) => {
        let oldpath = files.file.path;
        let extension = files.file.name.split('.').pop();

        const identification = files.file.name.replace(/\.[^/.]+$/, "")
        const employeesCount = await db.pg('employee')
            .where('identification', identification)

        let newpath = `holographic-signatures/${identification}.${extension}`;

        if (employeesCount.length > 0) {

            fs.copyFile(oldpath, `./src/public/${newpath}`, async (err) => {
                if (err) {
                    utils.insertLogs(fields.email, err, 'Alta individual de firma', 'WARNING');
                    return res.status(400).json({
                        status: 'success',
                        data: 'Informacion invalida enviada a la API!',
                    });
                }

                await db.pg('employee')
                    .where('identification', identification)
                    .update({
                        firma_holografa: newpath
                    })

                let message = "Firma subida: " + identification;
                utils.insertLogs(fields.email, message, 'Alta individual de firma', 'INFO');

                return res.status(200).json({
                    status: 'success',
                    data: 'Firma subida con éxito',
                });
            });

        } else {
            let message = "El empleado no existe/" + identification;
            utils.insertLogs(fields.email, message, 'Alta individual de firma', 'WARNING');

            return res.status(400).json({
                status: 'success',
                data: 'El empleado no existe!',
            });
        }

    });
})

router.post('/upload-holographic-signature-masive', async (req, res, next) => {
    var form = new IncomingForm();

    return form.parse(req, async (err, fields, files) => {
        let oldpath = files.file.path;
        fs.readFile(oldpath, function (err, data) {
            if (err) throw err;
            JSZip.loadAsync(data).then(function (zip) {
                Object.keys(zip.files).forEach(async filename => {

                    const identification = filename.replace(/\.[^/.]+$/, "")
                    const employeesCount = await db.pg('employee')
                        .where('identification', identification)

                    if (employeesCount.length > 0) {

                        let extension = filename.split('.').pop();
                        let newpath = `holographic-signatures/${identification}.${extension}`;
                        let firma = `holographic-signatures/${identification}.${extension}`;

                        fs.copyFile(oldpath, `./src/public/${newpath}`, async (err) => {
                            if (err) {
                                utils.insertLogs(fields.email, err, 'Alta masiva de firma', 'INFO');
                                return res.status(400).json({
                                    status: 'error',
                                    data: 'Informacion invalida enviada a la API!',
                                });
                            }

                            await db.pg('employee')
                                .where('identification', identification)
                                .update({
                                    firma_holografa: newpath
                                })

                            let message = "Firma subida: " + identification;
                            utils.insertLogs(fields.email, message, 'Alta masiva de firma', 'INFO');

                        });

                    } else {
                        let message = "El empleado no existe: " + identification;
                        utils.insertLogs(fields.email, message, 'Alta masiva de firma', 'INFO');

                    }

                })

                return res.status(200).json({
                    status: 'success',
                    data: 'Firmas subidas con éxito',
                });
            });
        });

    });
})

router.post('/forgot-password', async (req, res, next) => {
    const user = await db.pg('employee')
        .where('email', req.body.email)

    if (user.length > 0) {
        const password = utils.simpleRandomHash(10)

        await db.pg('usuario')
            .where('email', req.body.email)
            .update({
                password: utils.cryptPasswordSync(password),
                change_pwd: false
            })

        const data = { ...user[0], password }
        await EnviaEmailPassword(data)
        db.pg('control').then(async (result) => {
            if (result[0].sms) {
                await EnviaSMSPassword(data);
            }
        })
    }

    res.json({
        status: 'success'
    })
})

router.get('/sucursal', async (req, res, next) => {
    const data = await db.pg('employee').distinct('sucursal').select('sucursal');
    res.json({
        status: 'success',
        data: data
    })
})

router.get('/cargos', async (req, res, next) => {
    const data = await db.pg('cargos').select('desc_cargo').orderBy('desc_cargo', 'asc');
    res.json({
        status: 'success',
        data: data
    })
})

router.get('/depart', async (req, res, next) => {
    const data = await db.pg('departamentos').select('desc_departamento').orderBy('desc_departamento', 'asc');
    res.json({
        status: 'success',
        data: data
    })
})


router.get('/group', async (req, res, next) => {
    const data = await db.pg('employee')
        .select('employee.id as id_emp', 'usuario.id', 'user_profile.profile_slug', 'usuario_perfiles.profile_id')
        .join('usuario', 'employee.user_id', 'usuario.id')
        .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
        .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
        .where('employee.email', '=', req.query.email)
    res.json({
        status: 'success',
        data: data
    })
})

router.get('/xmlid', async (req, res, next) => {
    const data = await db.pg('employee')
        .select('employee.id', 'employee.apellidos', 'employee.nombres', 'employee.sueldo_jornal as sueldoJornal', 'employee.email',
            'employee.ips_empleado as ipsEmpleado', 'employee.identification', 'employee.mtess_patronal as mtessPatronal',
            'employee.firma_holografa as firmaHolografa', 'employee.contrato', 'employee.legajo', 'employee.number_count', 'employee.nro_padron',
            'employee.telefono', 'departamentos.desc_departamento as departamento', 'user_group.name as sucursal', 'cargos.desc_cargo as cargo')
        .join('departamentos', 'departamentos.id', 'employee.departamento')
        .join('cargos', 'cargos.id', 'employee.cargo')
        .join('xml', 'xml.employee_id', 'employee.id')
        .join('usuario', 'usuario.id', 'employee.user_id')
        .join('user_user_group', 'user_user_group.user_id', 'usuario.id')
        .join('user_group', 'user_group.id', 'user_user_group.user_group_id')
        .where('xml.id', '=', req.query.id)
    res.json({
        status: 'success',
        data: data[0]
    })
})

router.get('/actualizar', async (req, res, next) => {
    const empleado = await db.pg('employee')
        .select('employee.id', 'employee.apellidos', 'employee.nombres', 'employee.sueldo_jornal as sueldoJornal', 'employee.email',
            'employee.ips_empleado as ipsEmpleado', 'employee.identification', 'employee.mtess_patronal as mtessPatronal', 'employee.firma_holografa as firmaHolografa', 'employee.contrato', 'employee.legajo',
            'employee.telefono', 'employee.number_count as numberCount', 'employee.nro_padron')
        .where('employee.id', '=', req.query.id)

    const departamento = await db.pg('employee')
        .select('departamentos.desc_departamento as departamento')
        .join('departamentos', 'departamentos.id', 'employee.departamento')
        .where('employee.id', '=', req.query.id)

    const cargo = await db.pg('employee')
        .select('cargos.desc_cargo as cargo')
        .join('cargos', 'cargos.id', 'employee.cargo')
        .where('employee.id', '=', req.query.id)

    res.json({
        status: 'success',
        data: empleado[0],
        departamento: departamento[0],
        cargo: cargo[0]
    })
})

router.get('/director', async (req, res, next) => {
    console.log(req.query.email)
    if (req.query.email) {

        const data = await db.pg
            .table('employee')
            .join('usuario', 'employee.user_id', 'usuario.id')
            .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
            .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
            .select('employee.nombres', 'employee.apellidos')
            .where('user_profile.profile_slug', '=', 'director')
            .where('employee.email', req.query.email)

        if (data.length > 0) {
            console.log("Usuario con perfil director")
            res.json({
                status: 'success',
                data: data
            })
        } else {
            console.log("Usuario sin perfil director")
            const data = await db.pg
                .table('employee')
                .join('usuario', 'employee.user_id', 'usuario.id')
                .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
                .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
                .select('employee.nombres', 'employee.apellidos')
                .where('user_profile.profile_slug', '=', 'director')

            res.json({
                status: 'success',
                data: data
            })
        }

    } else {
        console.log("Solicitud sin email")
        const data = await db.pg
            .table('employee')
            .join('usuario', 'employee.user_id', 'usuario.id')
            .join('usuario_perfiles', 'usuario.id', 'usuario_perfiles.user_id')
            .join('user_profile', 'usuario_perfiles.profile_id', 'user_profile.id')
            .select('employee.nombres', 'employee.apellidos')
            .where('user_profile.profile_slug', '=', 'director')

        res.json({
            status: 'success',
            data: data
        })

    }
})

async function EnviaEmailPassword(data) {
    let to = data.email; // 'andre.santos@digitalife.com.py';
    let toName = data.nombres + " " + data.apellidos;

    let email = {
        from: 'DigitaLife',
        to: to, //to,
        toName: toName,
        password: data.password,
        subject: 'Bienvenido/a a Talento100',
        // template: 'new-user'
        html: `<h3>Hola ${toName}<h3><p>Bienvenido/a a Talento100. <br>Puede ingresar haciendo click <a href="${process.env.HOST}/login">aquí</a></p>`
    };
    let control = await db.pg('control');
    if (control[0].ext_email) {
        email.id_plantilla = process.env.EMAIL_WS_RECUPERAR_PASS;
        return await utils.sendMailExt(email);
    } else {
        return await utils.sendMail(email);
    }
}

async function EnviaSMSPassword(data) {
    db.pg('employee').where('email', data.email).then(async (result) => {
        db.pg('company').select('razon_social').then(async (datos) => {
            let message = 'Su clave temporal es ' + data.password + ' para la plataforma de recibo de salario ' + datos[0].razon_social;
            return await utils.sendSMS(result[0].telefono, data.password, message);
        })
    })
}

router.get('/cantemp', async (req, res, next) => {
    var result = await db.pg('employee').count('id');
    if (result[0][''] == 0) {
        return res.status(200).json({
            status: 'success',
            data: [{ "count": result[0][''] }]
        })
    } else if (result[0]['']) {
        return res.status(200).json({
            status: 'success',
            data: [{ "count": result[0][''] }]
        })
    } else {
        return res.status(200).json({
            status: 'success',
            data: result
        })
    }
})

router.get('/cantempcert', async (req, res, next) => {
    var result = await db.pg('employee').count('id').where('cert_added', true);
    if (result[0][''] == 0) {
        return res.status(200).json({
            status: 'success',
            data: [{ "count": result[0][''] }]
        })
    } else if (result[0]['']) {
        return res.status(200).json({
            status: 'success',
            data: [{ "count": result[0][''] }]
        })
    } else {
        return res.status(200).json({
            status: 'success',
            data: result
        })
    }
})

router.get('/cantempcertcor', async (req, res, next) => {
    var result = await db.pg('employee').count('id').where('cert_correct', true);
    if (result[0][''] == 0) {
        return res.status(200).json({
            status: 'success',
            data: [{ "count": result[0][''] }]
        })
    } else if (result[0]['']) {
        return res.status(200).json({
            status: 'success',
            data: [{ "count": result[0][''] }]
        })
    } else {
        return res.status(200).json({
            status: 'success',
            data: result
        })
    }
})

module.exports = router;