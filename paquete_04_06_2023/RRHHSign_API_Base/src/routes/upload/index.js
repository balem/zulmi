var express = require("express");
var router = express.Router();
var moment = require("moment");
var jwt = require('jsonwebtoken');
const { IncomingForm } = require("formidable");
const XLSX = require('xlsx');
const db = require('../../modules/db/db');
const util = require('../../modules/utils');
var aes256 = require('aes256');
const utils = require("../../modules/utils");
require("dotenv-safe").load();

router.post("/", async function (req, res, next) {
    var data = req.body;
    var password = aes256.decrypt('itau', data.password);
    //let email = await db.pg('usuario').select('email').where('profile_id', '=', db.pg('user_profile').select('id').where('up.profile_name=', '=', 'RH'));
    //util.insertLogs(email[0].email, 'Carga de varios registros de recibos');
    //var user = await userId(data.ruc, data.user, data.password);
    var result = db.pg('company').where('ruc', data.ruc).select(['id', 'password']);
    var rows = await result;
    if (rows.length > 0) {
        util.comparePassword(password.replace(/ /g, ''), rows[0]['password'], async function (err, result) {
            var returning = [];
            if (result) {
                returning.push(rows[0]['id']);
                var hash = { 'id': returning[0] };
                var token = await jwt.sign(hash, process.env.SECRET, {
                    expiresIn: 3000
                });
                returning = { "token": token };
            } else {
                returning.push({ "error": "La compañia invalida" });
            }
            res.status(200).json(returning);
        });
    } else {
        res.status(415).json({ "error": "La compañia invalida" });
    }
});

router.post("/receivefile", async function (req, res, next) {
    var form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
        var workbook = XLSX.read(files.file.path, { type: 'file', bookType: "xlss" });
        var sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        util.insertLogs(fields.mail_creator, 'Carga de un lote de recibos con: ' + sheet.length + ' registros', 'Carga Planilla Excel', 'INFO');

        let control = await db.pg('control');
        var errores = 0
        var count_recibos = 0
        var total_lote = 0
        let xml_errores = []

        try {
            var document_id = await db.pg('document')
                .insert({
                    start_date: fields.start_date,
                    end_date: fields.end_date,
                    creator: fields.creator,
                    observation: fields.tipo_documento,
                    status: 'PEN'
                }).returning('id')

            var company_id = await db.pg.select('id').table('company')

            let recibos = await formatear_json(sheet)

            for (const cedula in recibos) {
                total_lote++
                if (Object.hasOwnProperty.call(recibos, cedula)) {
                    const data = recibos[cedula];

                    var recibo = await verifyExitsExcel(data.recibo[0].numero_recibo)

                    if (recibo > 0) {
                        errores++
                        count_recibos++
                        let descripcion = "El recibo ya existe: Mes: " + data.recibo[0].mes_de_pago + ", Fecha de pago: " + data.recibo[0].fecha_de_pago + ", Neto a cobrar: " + data.recibo[0].netoacobrar
                        util.rejectLoadFront(cedula, {
                            nombres: data.recibo[0].nombres,
                            apellidos: data.recibo[0].apellidos,
                            mes_de_pago: data.recibo[0].mes_de_pago,
                            numero_recibo: data.recibo[0].numero_recibo,
                        }, descripcion);
                    } else {
                        var employee = await db.pg.select('id').table('employee').where('identification', 'like', `%${cedula}%`)

                        if (employee.length == 0) {
                            errores++
                            var descripcion = 'Empleado no registrado:' + cedula;
                            util.rejectLoadFront(cedula, data.recibo[0], descripcion);
                        } else {
                            try {
                                var xml = await db.pg('xml')
                                    .insert({
                                        document_id: document_id[0],
                                        employee_id: employee[0].id,
                                        company_id: company_id[0].id,
                                        identificator: fields.tipo_documento,
                                        mes_de_pago: data.recibo[0].mes_de_pago,
                                        total_ingresos: data.recibo[0].totalhaberes,
                                        total_retenciones: data.recibo[0].totaldescuentos,
                                        total_neto: data.recibo[0].netoacobrar,
                                        neto_en_letras: data.recibo[0].netoenletras,
                                        fecha_de_pago: data.recibo[0].fecha_de_pago,
                                        status_envio: false,
                                        periodo: data.recibo[0].periodo,
                                        numero_recibo: data.recibo[0].numero_recibo
                                    }).returning('id')
                            } catch (e) {
                                errores++
                                util.rejectLoadFront(cedula,
                                    {
                                        mes_de_pago: data.recibo[0].mes_de_pago,
                                        numero_recibo: data.recibo[0].numero_recibo,
                                        nombres: data.recibo[0].nombres,
                                        apellidos: data.recibo[0].apellidos
                                    }, JSON.stringify(e.message));
                            }

                            for (const element of data.recibo) {
                                if (control[0].use_concept) {
                                    var codConcepto = await GetEquivalenciaConcepto(element.codigo);
                                } else {
                                    var codConcepto = await GetConcepto(element.codigo);
                                }
                                if (codConcepto) {

                                    if (codConcepto == 1) {
                                        await db.pg.update({
                                            salario_mensual: element.ingresos
                                        }).table('xml').where('id', xml[0])

                                        await db.pg.update({
                                            sueldo_jornal: element.ingresos
                                        }).table('employee').where('id', employee[0].id)
                                    }

                                    try {
                                        await db.pg('xml_details')
                                            .insert({
                                                xml_id: xml[0],
                                                codigo: codConcepto,
                                                descripcion: element.descripcion,
                                                cant: element.cantidad,
                                                ingresos: element.ingresos,
                                                retenciones: element.retenciones
                                            })
                                    } catch (e) {
                                        errores++
                                        util.rejectLoadFront(cedula,
                                            {
                                                mes_de_pago: data.recibo[0].mes_de_pago,
                                                numero_recibo: data.recibo[0].numero_recibo,
                                                nombres: data.recibo[0].nombres,
                                                apellidos: data.recibo[0].apellidos
                                            }, JSON.stringify(e.message));
                                    }

                                } else {
                                    errores++
                                    xml_errores.push({ id: xml[0] })

                                    var descripcion = 'El concepto no existe:' + element.codigo + "/" + element.descripcion;
                                    util.rejectLoadFront(cedula, element, descripcion);
                                }
                            }
                        }
                    }

                }
            }

            if (count_recibos == total_lote) {

                descripcion = "El lote ya existe";
                utils.insertLogs(fields.mail_creator, descripcion, 'Carga Planilla Excel', 'WARNING')

                await db.pg.delete().table('document').where('id', document_id[0]);

                return res.status(200).json({
                    status: "existe"
                });
            } else if (errores > 0) {

                if (xml_errores.length > 0) {
                    xml_errores.forEach(async element => {
                        console.log(element)
                        await db.pg('xml_details').where('xml_id', element.id).del().then(async () => {
                            await db.pg('xml').where('id', element.id).del().then(async () => {
                                const xml = await db.pg.table('xml').where('document_id', document_id[0])
                                if (xml.length == 0) {
                                    await db.pg.delete().table('document').where('id', document_id[0]);
                                }
                            })
                        })
                    });
                } else {
                    const xml = await db.pg.table('xml').where('document_id', document_id[0])
                    if (xml.length == 0) {
                        await db.pg.delete().table('document').where('id', document_id[0]);
                    }
                }

                return res.status(200).json({
                    status: "error"
                });
            } else {
                return res.status(200).json({
                    status: "success"
                });
            }
        } catch (error) {
            console.log(error)
            utils.insertLogs(fields.mail_creator, error, 'Carga Planilla Excel', 'ERROR')
        }
    })

});

async function formatear_json(sheet) {
    let nuevoObjeto = {}
    sheet.forEach(async data => {
        const mesPago = moment(data.mesdepago, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
        //const FechaPago = moment(data.fechadepago, 'DD/MM/YYYY').format('YYYY-MM-DD');
        //Recorremos el arreglo 
        //Si la cedula no existe en nuevoObjeto entonces
        //la creamos e inicializamos el arreglo de recibos. 
        if (!nuevoObjeto.hasOwnProperty(data.cedula)) {
            nuevoObjeto[data.cedula] = {
                recibo: []
            }
        }
        //Agregamos los detalles. 
        nuevoObjeto[data.cedula].recibo.push({
            nombres: data.nombres,
            apellidos: data.apellidos,
            mes_de_pago: mesPago,
            totalhaberes: data.totalhaberes,
            totaldescuentos: data.totaldescuentos,
            netoacobrar: data.netoacobrar,
            netoenletras: data.netoenletras,
            fecha_de_pago: data.fechadepago,
            periodo: data.mesdepago,
            numero_recibo: data.numerorecibo,
            codigo: data.codconcepto,
            descripcion: data.detalledescripcion,
            cantidad: data.cantidad,
            ingresos: data.haberes,
            retenciones: data.descuentos
        })
    })

    return nuevoObjeto
}


router.post("/receive_employee", async (req, res, next) => {
    verifyJWT(req, res, next).then((id) => {
        returnId('company', 'id', id).then(async (comp) => {
            if (comp.length > 0) {

                var result = []
                var errores = []
                var insert = 0
                var update = 0
                var reject = 0

                var array = req.body;

                util.insertLogsWS(null, JSON.stringify(array), 'Carga de empleados WS', 'INFO');

                for (const data of array.empleados) {

                    let employee = await db.pg('employee').where('identification', data.cedula)

                    if (employee.length > 0) {

                        update++

                        let employeeUpdatedData = {}

                        if (data.nombres) {
                            employeeUpdatedData['nombres'] = data.nombres
                        }
                        if (data.apellidos) {
                            employeeUpdatedData['apellidos'] = data.apellidos
                        }
                        if (data.sueldo_jornal) {
                            employeeUpdatedData['sueldo_jornal'] = data.sueldo_jornal
                        }
                        if (data.email) {

                            if (util.validateEmail(data.email) === false) {
                                reject++
                                errores.push({ "result": "Empleado: " + data.cedula + ", Detalle: Email no válido: " + data.email });
                                let message = 'Empleado: ' + data.cedula + ', Detalle: Email no válido: ' + data.email;
                                util.insertLogs(null, message, 'Actualizacion de empleados WS', 'WARNING');
                            } else {
                                employeeUpdatedData['email'] = data.email
                            }
                        }
                        if (data.contrato) {
                            employeeUpdatedData['contrato'] = data.contrato
                        }
                        if (data.departamento) {
                            const departamento = await db.pg
                                .select('id')
                                .table('departamentos')
                                .where('desc_departamento', data.departamento)
                            if (departamento.length > 0) {
                                employeeUpdatedData['departamento'] = departamento[0].id;
                            } else {
                                reject++
                                errores.push({ "result": "Empleado: " + data.cedula + ", Detalle: Departamento no registrado: " + data.departamento });
                                let message = "Empleado: " + data.cedula + ", Detalle: Departamento no registrado: " + data.departamento
                                util.insertLogs(null, message, 'Actualizacion de empleados WS', 'WARNING');
                            }
                        }
                        if (data.cargo) {
                            const cargo = await db.pg
                                .select('id')
                                .table('cargos')
                                .where('desc_cargo', data.cargo)
                            if (cargo.length > 0) {
                                employeeUpdatedData['cargo'] = cargo[0].id;
                            } else {
                                reject++
                                errores.push({ "result": "Empleado: " + data.cedula + ", Detalle: Cargo no registrado: " + data.cargo });
                                let message = "Empleado: " + data.cedula + ", Detalle: Cargo no registrado: " + data.cargo
                                util.insertLogs(null, message, 'Actualizacion de empleados WS', 'WARNING');
                            }
                        }
                        if (data.legajo) {
                            employeeUpdatedData['legajo'] = data.legajo;
                        }
                        if (data.sucursal) {
                            const employee = await db.pg("employee")
                                .select('user_id')
                                .where("identification", data.cedula)
                            await db.pg('user_user_group').where('user_id', employee[0].user_id).delete()

                            var userId = await db.pg('usuario').where('email', '=', data.email).select('id');
                            var grouId = await db.pg('user_group').where('name', '=', data.sucursal).select('id');

                            if (grouId.length > 0) {

                                await db.pg('user_user_group').insert({
                                    user_id: userId[0].id,
                                    user_group_id: grouId[0].id
                                });

                            } else {
                                let message = 'Empleado: ' + data.cedula + ', Detalle: No existe la sucursal: "' + data.sucursal;
                                util.insertLogs(null, message, 'Actualizacion de empleados WS', 'WARNING');
                            }

                        }
                        if (data.numero_cuenta) {
                            employeeUpdatedData['number_count'] = data.numero_cuenta;
                        }
                        if (data.numero_padron) {
                            employeeUpdatedData['nro_padron'] = data.numero_padron;
                        }
                        if (data.mtess_patronal) {

                            const patronal = await db.pg
                                .select('mtess_patronal')
                                .table('patronal')
                                .where('mtess_patronal', data.mtess_patronal)
                            if (patronal.length > 0) {
                                employeeUpdatedData['mtess_patronal'] = data.mtess_patronal;
                            } else {
                                reject++
                                console.log("MTESS Patronal no registrado: " + data.mtess_patronal);
                                errores.push({ "result": "Empleado: " + data.cedula + ", Detalle: MTESS Patronal no registrado: " + data.mtess_patronal });
                                let message = "Empleado: " + data.cedula + ", Detalle: MTESS Patronal no registrado: " + data.mtess_patronal
                                util.insertLogs(null, message, 'Actualizacion de empleados WS', 'WARNING');
                            }

                        }

                        employeeUpdatedData['modified_at'] = moment().format("YYYY-MM-DD HH:mm:ss");

                        (
                            Object.keys(employeeUpdatedData).length > 0 ?
                                db.pg("employee")
                                    .where("identification", data.cedula)
                                    .update(employeeUpdatedData) :
                                new Promise((resolve, reject) => resolve(true))
                        )
                            .then(() => {

                                let updatedData = {}

                                if (data.nombres) {
                                    updatedData['name'] = data.nombres + " " + data.apellidos
                                }

                                if (data.email) {
                                    if (util.validateEmail(data.email) === false) {
                                        errores.push({ "result": "Empleado: " + data.cedula + ", Detalle: Email no válido: " + data.email });
                                        let message = "Empleado: " + data.cedula + ", Detalle: Email no válido: " + data.email;
                                        util.insertLogs(null, message, 'Actualizacion de empleados WS', 'WARNING');
                                    } else {
                                        updatedData['email'] = data.email
                                    }
                                }

                                if (data.activo) {
                                    updatedData['active'] = data.activo
                                }

                                updatedData['modified_at'] = moment().format("YYYY-MM-DD HH:mm:ss");

                                return Object.keys(updatedData).length > 0 ?
                                    db.pg('usuario')
                                        .whereIn('id', function () {
                                            return this.select('user_id').from('employee').where('identification', data.cedula)
                                        })
                                        .update(updatedData) :
                                    new Promise((resolve, reject) => resolve(true))
                            })

                    } else {

                        if (util.validateEmail(data.email) === false) {
                            reject++
                            errores.push({ "result": "Email no válido: " + data.email });
                            let message = "Empleado: " + data.cedula + ", Email no válido: " + data.email;
                            util.insertLogs(null, message, 'Alta de empleados WS', 'WARNING');
                        } else {
                            await db.pg
                                .select("user_profile.*")
                                .table("user_profile")
                                .where("profile_slug", "funcionario")
                                .then(async profiles => {

                                    await db.pg
                                        .select('mtess_patronal')
                                        .table('patronal')
                                        .where('mtess_patronal', data.mtess_patronal)
                                        .then(async mtess => {
                                            if (mtess.length == 0) {
                                                reject++
                                                console.log("MTESS Patronal no registrado");
                                                errores.push({ "result": "Empleado: " + data.cedula + ", Detalle: MTESS Patronal no registrado: " + data.mtess_patronal });
                                                let message = "Empleado: " + data.cedula + ", Detalle: MTESS Patronal no registrado: " + data.mtess_patronal;
                                                util.insertLogs(null, message, 'Alta de empleados WS', 'WARNING');
                                            } else {

                                                let employee = await db.pg('employee').where('email', data.email)

                                                if (employee.length > 0) {
                                                    reject++
                                                    errores.push({ "result": "Empleado: " + data.cedula + ", Detalle: El email ya existe: " + data.email });
                                                    let message = "Empleado: " + data.cedula + ", El email ya existe: " + data.email;
                                                    util.insertLogs(null, message, 'Alta de empleados WS', 'WARNING');
                                                } else {

                                                    await db.pg
                                                        .insert({
                                                            name: data.nombres + ' ' + data.apellidos,
                                                            email: data.email,
                                                            password: null,
                                                            profile_id: profiles[0].id,
                                                            change_pwd: false,
                                                            active: data.activo
                                                        })
                                                        .table("usuario")
                                                        .then(async () => {
                                                            await db.pg
                                                                .select("usuario.*")
                                                                .table("usuario")
                                                                .where("email", "=", data.email || '')
                                                                .then(async users => {

                                                                    await db.pg('usuario_perfiles')
                                                                        .insert({
                                                                            user_id: users[0].id,
                                                                            profile_id: profiles[0].id,
                                                                        });

                                                                    if ((data.sucursal) && (data.sucursal != '')) {
                                                                        var userId = await db.pg('usuario').where('email', '=', data.email).select('id');
                                                                        var grouId = await db.pg('user_group').where('name', '=', data.sucursal).select('id');

                                                                        if (grouId.length > 0) {

                                                                            await db.pg('user_user_group').insert({
                                                                                user_id: userId[0].id,
                                                                                user_group_id: grouId[0].id
                                                                            });

                                                                        } else {
                                                                            reject++
                                                                            errores.push({ "result": "Empleado: " + data.cedula + ", No existe la sucursal:" + data.sucursal });
                                                                            let message = "Empleado: " + data.cedula + ", No existe la sucursal: " + data.sucursal;
                                                                            util.insertLogs(null, message, 'Alta de empleados WS', 'WARNING');
                                                                        }

                                                                    }

                                                                    var depart = null

                                                                    if ((data.departamento) && (data.departamento != '')) {
                                                                        var sqldepart = await db.pg('departamentos').where('desc_departamento', '=', data.departamento).select('id');
                                                                        if (sqldepart.length == 0) {
                                                                            reject++
                                                                            errores.push({ "result": "Empleado: " + data.cedula + ", No existe el departamento: " + data.departamento });
                                                                            let message = "Empleado: " + data.cedula + ", No existe el departamento: " + data.departamento
                                                                            util.insertLogs(null, message, 'Alta de empleados WS', 'WARNING');

                                                                        } else {
                                                                            depart = sqldepart[0].id
                                                                        }
                                                                    }

                                                                    var cargo = null

                                                                    if ((data.cargo) && (data.cargo != '')) {
                                                                        var sqlcargo = await db.pg('cargos').where('desc_cargo', '=', data.cargo).select('id');
                                                                        if (sqlcargo.length == 0) {
                                                                            reject++
                                                                            errores.push({ "result": "Empleado: " + data.cedula + ", No existe el cargo: " + data.cargo });
                                                                            let message = "Empleado: " + data.cedula + ", No existe el cargo: " + data.cargo
                                                                            util.insertLogs(null, message, 'Alta de empleados WS', 'WARNING');

                                                                        } else {
                                                                            cargo = sqlcargo[0].id
                                                                        }
                                                                    }

                                                                    await db.pg
                                                                        .insert({
                                                                            nombres: data.nombres,
                                                                            apellidos: data.apellidos,
                                                                            sueldo_jornal: data.sueldo_jornal,
                                                                            ips_empleado: null, //data.ips_empleado,
                                                                            fecha_ingresso: null, //data.fecha_ingreso,
                                                                            email: data.email.toLowerCase(),
                                                                            identification: data.cedula,
                                                                            contrato: data.contrato,
                                                                            user_id: users[0].id,
                                                                            legajo: data.legajo,
                                                                            cargo: cargo,
                                                                            mtess_patronal: data.mtess_patronal,
                                                                            departamento: depart,
                                                                            number_count: data.numero_cuenta,
                                                                            nro_padron: data.numero_padron,
                                                                            send_mail: true
                                                                        })
                                                                        .table("employee")
                                                                        .then(async () => {

                                                                            let message = 'Registro creado: ' + data.cedula + "/" + data.email;
                                                                            util.insertLogs(null, message, 'Alta de empleados WS', 'INFO');

                                                                            result.push({ "result": "Empleado creado con éxito: " + data.cedula + "/" + data.email });
                                                                            insert++
                                                                            let emailData = {
                                                                                email: data.email,
                                                                                nombres: data.nombres,
                                                                                apellidos: data.apellidos
                                                                            }

                                                                            let emailResponse = await EnviaEmailPassword(emailData)

                                                                            if (emailResponse.status == 'success') {
                                                                                console.log("Correo electrónico enviado")
                                                                            } else {
                                                                                util.insertLogs(null, emailResponse.message + ', Email:' + data.email, 'Alta masiva de empleado: envio de correo', 'ERROR');
                                                                                console.log("No se pudo enviar el correo")
                                                                            }

                                                                        }).catch(function (e) {
                                                                            console.log(e.message)
                                                                        });
                                                                })
                                                        })
                                                }

                                            }
                                        })
                                });
                        }
                    }
                }

                if (errores.length > 0) {

                    errores.push({ "result": "Errores: " + reject + ", Nuevos: " + insert + ", Actualizados: " + update + ", Procesados: " + array.empleados.length });

                    res.status(200).json({
                        status: "error",
                        data: errores
                    });
                } else {

                    result.push({ "result": "Nuevos: " + insert + ", Actualizados: " + update + ", Procesados: " + array.empleados.length });

                    res.status(200).json({
                        status: "success",
                        data: result
                    });
                }


            } else {
                res.status(415).json({
                    status: "error",
                    data: "token invalido"
                });
            }
        });
    })
})

async function EnviaEmailPassword(data) {
    let to = data.email; // 'andre.santos@digitalife.com.py';
    let toName = data.nombres + " " + data.apellidos;

    let email = {
        from: 'DigitaLife',
        to: to, //to,
        toName: toName,
        password: null,
        subject: 'Bienvenido/a a Talento100',
        html: `<h3>Hola ${toName}<h3><p>Bienvenido/a a Talento100. <br>Puede ingresar haciendo click <a href="${process.env.HOST}/login">aquí</a></p>`
    };
    let control = await db.pg('control');
    if (control[0].ext_email) {
        email.id_plantilla = process.env.EMAIL_WS_RECUPERAR_PASS;
        return await util.sendMailExt(email);
    } else {
        return await util.sendMail(email);
    }
}

router.post("/receive_document", async function (req, res, next) {
    verifyJWT(req, res, next).then((id) => {
        returnId('company', 'id', id).then(async (comp) => {
            if (comp.length > 0) {
                //para el campo use_concept dentro de la tabla control
                let control = await db.pg('control');

                var data = req.body;

                util.insertLogsWS(null, JSON.stringify(data), 'Carga de recibos WS', 'INFO');
                var result = [];
                var insert_details = 0;
                //Verificación de datos de la empresa
                let ruc = "";
                if (data.ruc !== undefined) {
                    ruc = data.ruc;
                    var compId = await returnId('company', 'ruc', ruc);
                    if ((compId.length > 0) && (compId[0]['id'] !== undefined)) {
                        //Verificamos la estructura del mes de pago
                        if (data.mesPago.indexOf('/') > 0) {
                            data.mesPago = data.mesPago.replace('/', '-');
                        }
                        if (!moment(data.mesPago, 'YYYY-MM', true).isValid()) {
                            let ahno = data.mesPago.substring(3);
                            let mes = data.mesPago.substring(0, 2);
                            data.mesPago = mes + '-' + ahno;
                            //data.mesPago = moment(data.mesPago).format('MM-YYYY');
                        }
                        //Verificamos la estructura de la fecha de pago`
                        if (data.fechaPago.indexOf('/') > 0) {
                            data.fechaPago = data.fechaPago.replace('/', '-');
                        }

                        const firstDay = moment(data.mesPago, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
                        const lastDay = moment(data.mesPago, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
                        const paysDay = moment(data.fechaPago, 'YYYY-MM-DD').format('YYYY-MM-DD');

                        cols = ['start_date', 'end_date', 'creator', 'status'];
                        values = [firstDay, lastDay, 'SYS', 'PEN'];

                        let exist = await verifyExits(data, data.mesPago, paysDay);

                        if (exist.count < data.empleado.length) {

                            try {
                                var docuId = await insertIn('document', cols, values);
                            } catch (e) {
                                result.push({ "result": "Error en Insert de Documento: " + e.message });
                                util.rejectLoadWs({
                                    mes_de_pago: data.mesPago,
                                }, "Error en Insert de Documento: " + JSON.stringify(e.message), 'Carga WS', 'ERROR');
                            }

                            if (docuId !== undefined) {
                                //Verificación de datos del empleado
                                for (const element of data.empleado) {
                                    var ci = element.ci.trim();
                                    var emplId = await returnId('employee', 'identification', ci);

                                    if ((emplId.length > 0) && (emplId[0]['id']) !== undefined) {
                                        //Validación del xml

                                        if ((element.tipo == 'Salario') || (element.tipo == 'Aguinaldo') || (element.tipo == 'Gratificación') || (element.tipo == 'Bono')) {

                                            if (element.totales.totalIngresosNo == undefined || element.totales.totalIngresosNo == '') {
                                                element.totales.totalIngresosNo = 0;
                                            }

                                            cols = ['identificator', 'document_id', 'employee_id', 'company_id', 'mes_de_pago', 'total_ingresos', 'total_retenciones', 'total_neto', 'neto_en_letras', 'fecha_de_pago', 'status_envio', 'periodo', 'numero_recibo', 'total_ingresosno'];
                                            values = [element.tipo, docuId[0], emplId[0]['id'], compId[0]['id'], firstDay, element.totales.totalHaberes, element.totales.totalDescuentos, element.totales.netoACobrar, element.totales.netoEnLetras, paysDay, false, data.mesPago, element.nro_recibo, element.totales.totalIngresosNo];

                                            let exist = await verifyExitsXml(element.nro_recibo);

                                            if (exist.count > 0) {
                                                result.push({ "result": "El recibo ya existe: " + element.nro_recibo + ", Mes: " + data.mesPago });
                                                let descripcion = "El recibo ya existe: Mes: " + data.mesPago + ", Fecha de pago: " + paysDay + ", Neto a cobrar: " + element.totales.netoACobrar
                                                util.rejectLoadWs({
                                                    ci: element.ci,
                                                    nombres: element.nombres,
                                                    apellidos: element.apellidos,
                                                    mes_de_pago: data.mesPago,
                                                    nro_recibo: element.nro_recibo,
                                                }, descripcion, 'Carga WS', 'WARNING');
                                            } else {

                                                try {
                                                    var xmlId = await insertIn('xml', cols, values);
                                                } catch (e) {
                                                    result.push({ "result": "Nro Recibo: " + element.nro_recibo + ", Detalle: Error en Insert XML, " + e.message });
                                                    util.rejectLoadWs({
                                                        ci: element.ci,
                                                        nombres: element.nombres,
                                                        apellidos: element.apellidos,
                                                        mes_de_pago: data.mesPago,
                                                        nro_recibo: element.nro_recibo,
                                                    }, "Error en Insert XML: " + JSON.stringify(e.message), 'Carga WS', 'ERROR');
                                                }
                                                if (xmlId !== undefined) {
                                                    var i = 0;
                                                    for (const detail of element.conceptos) {

                                                        if (control[0].use_concept) {
                                                            var codConcepto = await GetEquivalenciaConcepto(detail.codConcepto.trim());
                                                        } else {
                                                            var codConcepto = await GetConcepto(detail.codConcepto.trim());
                                                        }

                                                        if (codConcepto) {

                                                            if (codConcepto == 1) {
                                                                await db.pg.update({
                                                                    salario_mensual: detail.haberes
                                                                }).table('xml').where('id', xmlId[0])

                                                                await db.pg.update({
                                                                    sueldo_jornal: detail.haberes
                                                                }).table('employee').where('id', emplId[0]['id'])
                                                            }

                                                            cols = ['xml_id', 'codigo', 'descripcion', 'cant', 'ingresos', 'retenciones'];
                                                            values = [xmlId[0], codConcepto, detail.detalleDescripcion, detail.cantidad, detail.haberes, detail.descuentos];
                                                            if (detail.ingresosNo !== undefined) {
                                                                cols.push('ingresosno');
                                                                values.push(detail.ingresosNo);
                                                            }
                                                            try {
                                                                await insertIn('xml_details', cols, values);
                                                            } catch (e) {
                                                                insert_details++
                                                                result.push({ "result": "Nro Recibo: " + element.nro_recibo + ", Detalle: Error en Insert XML, " + e.message });
                                                                util.rejectLoadWs({
                                                                    ci: element.ci,
                                                                    nombres: element.nombres,
                                                                    apellidos: element.apellidos,
                                                                    mes_de_pago: data.mesPago,
                                                                    nro_recibo: element.nro_recibo,
                                                                }, "Error en Insert XML_detail: " + JSON.stringify(e.message), 'Carga WS', 'ERROR');
                                                            }

                                                        } else {
                                                            /*si no se inserto ningun xml eliminamos el lote*/
                                                            if (insert_details == element.conceptos.length) {
                                                                await db.pg('xml_details').where('xml_id', xmlId[0]).del().then(async () => {
                                                                    await db.pg('xml').where('id', xmlId[0]).del().then(async () => {
                                                                        await db.pg('document').where('id', docuId[0]).del()
                                                                    })
                                                                })
                                                            } else {
                                                                /*si no se inserto un xml eliminamos la cabecera*/
                                                                await db.pg('xml_details').where('xml_id', xmlId[0]).del().then(async () => {
                                                                    await db.pg('xml').where('id', xmlId[0]).del()
                                                                })
                                                            }

                                                            result.push({ "result": "Nro Recibo: " + element.nro_recibo + ", Detalle: El concepto no existe: " + detail.codConcepto + "/" + detail.detalleDescripcion });

                                                            descripcion = "Concepto no registrado: " + detail.codConcepto + "/" + detail.detalleDescripcion;
                                                            util.rejectLoadWs({
                                                                ci: element.ci,
                                                                nombres: element.nombres,
                                                                apellidos: element.apellidos,
                                                                mes_de_pago: data.mesPago,
                                                                nro_recibo: element.nro_recibo,
                                                            }, descripcion, 'Carga WS', 'WARNING');
                                                        }

                                                    }
                                                }

                                            }

                                        } else {
                                            descripcion = "Tipo de documento no consistente: " + element.tipo;
                                            util.rejectLoadWs({
                                                ci: element.ci,
                                                nombres: element.nombres,
                                                apellidos: element.apellidos,
                                                mes_de_pago: data.mesPago,
                                                nro_recibo: element.nro_recibo,
                                            }, descripcion, 'Carga WS', 'WARNING');

                                            result.push({ "result": "Nro Recibo: " + element.nro_recibo + ", Detalle: Tipo de documento no existente: " + element.tipo });
                                        }
                                    } else {
                                        result.push({ "result": "Detalle: Empleado no registrado " + element.ci.trim() + "/" + element.nombres + " " + element.apellidos });

                                        descripcion = "Empleado no registrado: " + element.ci.trim() + "/" + element.nombres + " " + element.apellidos;
                                        util.rejectLoadWs({
                                            ci: element.ci,
                                            nombres: element.nombres,
                                            apellidos: element.apellidos,
                                            mes_de_pago: data.mesPago,
                                            nro_recibo: element.nro_recibo,
                                        }, descripcion, 'Carga WS', 'WARNING');
                                    }
                                }
                            }
                        } else {
                            descripcion = "El lote ya existe";
                            util.rejectLoadWs({
                                mes_de_pago: data.mesPago,
                            }, descripcion, 'Carga WS', 'WARNING');
                            res.status(200).json({
                                status: "error",
                                data: "El lote ya existe"
                            });
                        }
                    } else {
                        descripcion = "No existe la empresa suministrada: " + data.ruc;
                        util.rejectLoadWs({
                            mes_de_pago: data.mesPago,
                        }, descripcion, 'Carga WS', 'WARNING');
                        res.status(200).json({
                            status: "error",
                            data: descripcion
                        });
                    }
                } else {
                    descripcion = "Se requieren los datos de la empresa";
                    util.rejectLoadWs({
                        mes_de_pago: data.mesPago,
                    }, descripcion, 'Carga WS', 'WARNING');
                    res.status(200).json({
                        status: "error",
                        data: descripcion
                    });
                }
                console.log("errores: " + result.length)
                if (result.length > 0) {

                    const xml = await db.pg.table('xml').where('document_id', docuId[0])

                    if (xml.length == 0) {
                        await db.pg.delete().table('document').where('id', docuId[0]);
                    }

                    res.status(200).json({
                        status: "error",
                        data: result
                    });
                } else {
                    res.status(200).json({
                        status: "success",
                        data: "El lote se proceso correctamente!"
                    });
                }

            } else {
                res.status(415).json({
                    status: "error",
                    data: "token invalido"
                });
            }
        });
    })
});

async function GetEquivalenciaConcepto(value) {
    var result = await db.pg('equibalencia_concepto_salario').where('cod_company', '=', value);
    if (result.length > 0) {
        return result[0].cod_mtess;
    } else {
        return false;
    }
}

async function GetConcepto(value) {
    var result = await db.pg('concepto_salario').where('codigo', '=', value);
    if (result.length > 0) {
        return result[0].cod_mtess;
    } else {
        return false;
    }
}

async function returnId(table, camp, value) {
    var result = db.pg(table).where(camp, value).select('id');
    const rows = await result;
    return rows;
}

async function returnVal(table, camp, value, result) {
    var result = db.pg(table).where(camp, value).select(result);
    const rows = await result;
    return rows;
}

async function validateXML(nro_recibo) {
    var busca = {
        "xml.numero_recibo": nro_recibo
    };
    var result = db.pg('xml')
        .join('document', 'document.id', 'xml.document_id')
        .where('document.status', '<>', 'DES')
        .where(busca).select('xml.id');
    const rows = await result;

    return rows;
}

async function insertIn(table, cols, value) {
    var values = {};
    for (var i = 0; i < cols.length; i++) {
        values[cols[i]] = value[i];
    }
    var result = db.pg(table).insert(values).returning('id');
    const rows = await result;
    return rows;
}

function verifyJWT(req, res, next) {
    return new Promise((resolve, reject) => {
        var token = req.headers.authorization.split(' ');
        if (!token) return res.status(415).send({ auth: false, message: 'No token provided.' });
        jwt.verify(token[1], process.env.SECRET, function (err, decoded) {
            if (err) return res.status(415).send({ auth: false, message: 'Failed to authenticate token: ' + err });
            resolve(decoded.id);
        });
    });
}

async function verifyExitsXml(recibo) {
    var validate = await validateXML(recibo);
    return res = {
        count: validate.length
    };
}

async function verifyExitsExcel(recibo) {
    var cont = 0;
    var validate = await validateXML(recibo);
    if (validate.length > 0) {
        cont++
    }
    return cont
}

async function verifyExits(data, firstDay) {
    var cont = 0;
    for (const element of data.empleado) {
        var validate = await validateXML(element.nro_recibo);
        if (validate.length > 0) {
            cont++
        }
    }

    return res = {
        status: "success",
        count: cont
    };
}

module.exports = router;