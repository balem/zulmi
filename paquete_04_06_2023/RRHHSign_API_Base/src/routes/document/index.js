const IncomingForm = require("formidable").IncomingForm;
var express = require("express");
var router = express.Router();
var JSZip = require("jszip");
const db = require('../../modules/db/db');
const utils = require("../../modules/utils");
const xl = require('excel4node');
var eyes = require('eyes');
const bent = require('bent')
const moment = require('moment');
const fs = require("fs");
const pdfreader = require("pdfreader");
const axios = require('axios');
const numeroALetras = require("../../modules/numeroALetras");
const sendMessage = './message';

router.get('/download-report', async (req, res, next) => {

    let query = db.pg('document')
        .join('xml', 'xml.document_id', 'document.id')
        .join('employee', 'employee.id', 'xml.employee_id')
        .join('user_user_group', 'user_user_group.user_id', 'employee.user_id')
        .join('user_group', 'user_group.id', 'user_user_group.user_group_id')
        .select('xml.fecha_de_pago', 'xml.envio_mtess_date', 'xml.envio_mtess', 'xml.numero_recibo', 'xml.identificator',
            'xml.signature_director', 'xml.signature_director_datetime',
            'xml.signature_employee', 'xml.signature_employee_datetime', 'xml.periodo', 'employee.nombres',
            'employee.apellidos', 'employee.identification', 'employee.legajo', 'user_group.name as sucursal')
        .where('document.status', '<>', 'DES')
        .orderBy('xml.periodo', 'desc')

    var filtros = []
    var periodo = []

    if (req.query.tipo == 'ALL' || req.query.tipo == undefined) {
        query = query.where('xml.identificator', 'like', '%%')
    } else {
        filtros.push({ tipo: req.query.tipo })
        query = query.where('xml.identificator', 'like', `%${req.query.tipo}%`)
    }

    if (req.query.statusdir == 'ALL' || req.query.statusdir == undefined) {

    } else {

        if (req.query.statusdir == 'FIR') {
            filtros.push({ firma_director: "Firmado" })

            query = query.where('xml.signature_director', true)

        } else {
            filtros.push({ firma_director: "Pendiente" })
            query = query.where('xml.signature_director', false)
        }

    }

    if (req.query.statusemp == 'ALL' || req.query.statusemp == undefined) {

    } else {

        if (req.query.statusemp == 'FIR') {
            filtros.push({ firma_empleado: "Firmado" })
            query = query.where('xml.signature_employee', true)
        } else {
            filtros.push({ firma_empleado: "Pendiente" })
            query = query.where('xml.signature_employee', false)
        }

    }

    if (req.query.identification == 'ALL' || req.query.identification == undefined) {
        query = query.where('employee.identification', 'like', '%%')
    } else {
        filtros.push({ empleado: req.query.identification })
        query = query.where('employee.identification', req.query.identification).orWhere('employee.legajo', req.query.identification)
    }

    if (req.query.empleado == 'ALL' || req.query.empleado == undefined) {
        query = query.where('employee.identification', 'like', '%%')
    } else {
        filtros.push({ empleado: req.query.empleado })
        query = query.where('employee.identification', req.query.empleado)
    }


    if (req.query.sucursal == 'ALL' || req.query.sucursal == undefined) {
        query = query.where('user_group.name', 'like', '%%')
    } else {
        filtros.push({ sucursal: req.query.sucursal })
        query = query.where('user_group.name', 'like', `%${req.query.sucursal}%`)
    }
    if (req.query.date_from) {
        periodo.push({ fecha_inicial: req.query.date_from })
        query = query.where('xml.fecha_de_pago', '>=', req.query.date_from)
    }
    if (req.query.date_to) {
        periodo.push({ fecha_final: req.query.date_to })
        query = query.where('xml.fecha_de_pago', '<=', `${req.query.date_to} 23:59:59`)
    }

    var fecha = moment(req.query.fecha).format("YYYY-MM-DD");

    query.then(async documents => {
        createSheetReport(filtros, periodo, documents).then(file => {
            file.write(`Reporte de recibos-${fecha.replace('/', '-')}.xlsx`, res);
        })
    })
})

function createSheetReport(filtros, periodo, xmls) {

    return new Promise(resolve => {

        // setup workbook and sheet
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet('Sheet');

        var fecha = moment().format("DD/MM/YYYY H:mm:ss");

        var rowOffset = periodo ? 4 : 0
        var filas = 3

        ws.cell(1, 1)
            .string('Fecha de reporte: ' + fecha)

        if (periodo.length > 0) {
            ws.cell(2, 1)
                .string('Fecha inicial: ' + moment(periodo[0].fecha_inicial).format("DD/MM/YYYY"))
            ws.cell(3, 1)
                .string('Fecha final: ' + moment(periodo[1].fecha_final).format("DD/MM/YYYY"))

        } else {

        }

        filtros.forEach(element => {
            console.log(element)

            if (element.empleado) {
                filas++
                ws.cell(rowOffset++, 1)
                    .string('Empleado: ' + element.empleado)
            }

            if (element.firma_empleado) {
                filas++
                ws.cell(rowOffset++, 1)
                    .string('Firma Empleado: ' + element.firma_empleado)
            }

            if (element.firma_director) {
                filas++
                ws.cell(rowOffset++, 1)
                    .string('Firma Director: ' + element.firma_director)
            }

            if (element.sucursal) {
                filas++
                ws.cell(rowOffset++, 1)
                    .string('Sucursal: ' + element.sucursal)
            }

            if (element.tipo) {
                filas++
                ws.cell(rowOffset++, 1)
                    .string('Tipo Documento: ' + element.tipo)
            }

        });

        ws.cell(filas + 2, 1)
            .string('Tipo de Recibo')

        ws.cell(filas + 2, 2)
            .string('Fecha de Pago')

        ws.cell(filas + 2, 3)
            .string('Nro. Documento')

        ws.cell(filas + 2, 4)
            .string('Nro. Legajo')

        ws.cell(filas + 2, 5)
            .string('Nombre y apellido')

        ws.cell(filas + 2, 6)
            .string('Sucursal')

        for (let i = 0; i < xmls.length; i++) {

            let row = i + rowOffset + 2

            var fechaPago = moment(xmls[i].fecha_de_pago).format()
            var fecha = moment(fechaPago.toString().split("T")[0]).add(1, 'days')

            ws.cell(row, 1)
                .string(xmls[i].identificator)

            ws.cell(row, 2)
                .string(moment(fecha.toString().split("Moment")[0]).format("DD/MM/YYYY"))

            ws.cell(row, 3)
                .string(xmls[i].identification)

            ws.cell(row, 4)
                .string(xmls[i].legajo)

            ws.cell(row, 5)
                .string(xmls[i].nombres + " " + xmls[i].apellidos)

            ws.cell(row, 6)
                .string(xmls[i].sucursal)
        }

        resolve(wb)

    })
}

router.get('/report', async (req, res, next) => {

    let query = db.pg('document')
        .join('xml', 'xml.document_id', 'document.id')
        .join('employee', 'employee.id', 'xml.employee_id')
        .join('user_user_group', 'user_user_group.user_id', 'employee.user_id')
        .join('user_group', 'user_group.id', 'user_user_group.user_group_id')
        .select('xml.envio_mtess_date', 'xml.envio_mtess', 'xml.numero_recibo', 'xml.identificator',
            'xml.signature_director', 'xml.signature_director_datetime',
            'xml.signature_employee', 'xml.signature_employee_datetime', 'xml.periodo', 'employee.nombres',
            'employee.apellidos', 'employee.identification', 'employee.legajo', 'user_group.name as sucursal')
        .where('document.status', '<>', 'DES')
        .orderBy('xml.periodo', 'desc')

    console.log(req.query)

    if (req.query.tipo == 'ALL' || req.query.tipo == undefined) {
        query = query.where('xml.identificator', 'like', '%%')
    } else {
        query = query.where('xml.identificator', 'like', `%${req.query.tipo}%`)
    }

    if (req.query.statusdir == 'ALL' || req.query.statusdir == undefined) {

    } else {

        if (req.query.statusdir == 'FIR') {
            query = query.where('xml.signature_director', true)
        } else {
            query = query.where('xml.signature_director', false)
        }

    }

    if (req.query.statusemp == 'ALL' || req.query.statusemp == undefined) {

    } else {

        if (req.query.statusemp == 'FIR') {
            query = query.where('xml.signature_employee', true)
        } else {
            query = query.where('xml.signature_employee', false)
        }

    }

    if (req.query.identification == 'ALL' || req.query.identification == undefined) {
        query = query.where('employee.identification', 'like', '%%')
    } else {
        query = query.where('employee.identification', req.query.identification).orWhere('employee.legajo', req.query.identification)
    }

    if (req.query.empleado == 'ALL' || req.query.empleado == undefined) {
        query = query.where('employee.identification', 'like', '%%')
    } else {
        query = query.where('employee.identification', req.query.empleado)
    }


    if (req.query.sucursal == 'ALL' || req.query.sucursal == undefined) {
        query = query.where('user_group.name', 'like', '%%')
    } else {
        query = query.where('user_group.name', 'like', `%${req.query.sucursal}%`)
    }
    if (req.query.date_from) {
        query = query.where('xml.fecha_de_pago', '>=', req.query.date_from)
    }
    if (req.query.date_to) {
        query = query.where('xml.fecha_de_pago', '<=', `${req.query.date_to} 23:59:59`)
    }

    query.then(documents => res.json({
        status: 'success',
        data: documents
    }))
})

router.get('/xmlsSignatureStatus', async (req, res, next) => {

    await db.pg.select("document.start_date", "employee.id")
        .table("document")
        .join('xml', 'xml.document_id', 'document.id')
        .join('employee', 'employee.id', 'xml.employee_id')
        .where("xml.id", req.query.xml_id)
        .then(async xml => {
            fecha_xml = xml[0].start_date
            employee_id = xml[0].id
        })

    return db.pg.select("document.start_date")
        .table("document")
        .join('xml', 'xml.document_id', 'document.id')
        .where("xml.employee_id", employee_id)
        .where("xml.signature_employee", false)
        .where('document.start_date', '<', fecha_xml)
        .where('document.status', '<>', 'DES')
        .then(async document => {
            console.log(document)
            if (document.length > 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Existen documentos anteriores pendientes de firma, favor regularizar"
                });
            } else {
                return res.status(200).json({
                    status: 'success',
                })
            }

        })

})

router.get('/GetXmls', async (req, res, next) => {
    await db.pg('xml')
        .select('id')
        .where('document_id', req.query.id)
        .then(async xml => {
            console.log(xml.length)
            return res.status(200).json({
                status: 'success',
                data: xml.length
            })
        })

})

router.get('/GetXmlsCount', async (req, res, next) => {
    await db.pg('xml')
        .select('id')
        .where('document_id', req.query.id)
        .then(async xml => {
            console.log(xml.length)
            return res.status(200).json({
                status: 'success',
                data: xml.length
            })
        })

})

router.get('/countrecibos', async (req, res, next) => {
    await db.pg('xml')
        .select('id')
        .where('document_id', req.query.document_id)
        .where('signature_employee', false)
        .then(async xml => {
            console.log(xml.length)
            return res.status(200).json({
                status: 'success',
                data: xml
            })
        })

})

router.get('/getid', async (req, res, next) => {

    await db.pg('xml')
        .select('document_id')
        .where('id', req.query.id)
        .then(async xml => {
            var document = await db.pg('document').where('id', '=', xml[0].document_id)
                .select('start_date', 'end_date', 'observation');

            return res.status(200).json({
                status: 'success',
                data: document
            })

        }).catch(e => {
            return res.status(404).json({
                status: 'error',
                message: "No se recuperaron algunos datos del documento"
            })
        })

})

router.get('/GetXmlsCount', async (req, res, next) => {
    await db.pg('xml')
        .select('*')
        .count()
        .then(xml => {
            console.log(xml)
            return res.status(200).json({
                data: xml
            })
        }).catch(e => {
            return res.status(404).json({
                status: 'error',
                message: "No se encontraron documentos"
            })
        })

})

router.get('/list', async (req, res, next) => {

    console.log(req.query)

    let query = [];

    if (req.query.group) {

        query = db.pg('document')
            .select('*')
            .join("xml", "xml.document_id", "document.id")
            .join("employee", "xml.document_id", "xml.employee_id")
            .join("user_user_group", "user_user_group.user_id", "employee.user_id")
            .orderBy('document.created_at', 'desc')

    } else {
        query = db.pg('document')
            .select('*')
            .orderBy('created_at', 'desc')
    }

    if (req.query.start_date) {
        query = query.where('start_date', '>=', `${req.query.start_date}`)
    }

    if (req.query.end_date) {
        query = query.where('end_date', '<=', `${req.query.end_date}`)
    }

    if (req.query.status == 'T') {
        query = query.where('status', '=', req.query.status)
    }

    if (req.query.creador) {
        query = query.where('creator', 'like', '%' + req.query.creator + '%')
    }

    if (req.query.group) {
        query = query.where('group', '=', req.query.group)
    }

    query.then(documents => {
        console.log(documents)
        if (documents.length > 0) {
            return res.status(200).json({
                status: 200,
                data: documents
            })
        } else {
            return res.status(404).json({
                status: 404,
                message: "No se encontraron documentos"
            })
        }

    }).catch(e => {
        return res.status(404).json({
            status: 'error',
            message: "No se encontraron documentos"
        })
    })

})

router.post('/txt', async (req, res, next) => {
    var form = new IncomingForm();
    return form.parse(req, async (err, fields, files) => {
        const content = fs.readFileSync(files.file.path).toString()

        await textToDoc(content, fields)

        return res.status(200).json({
            status: 'success'
        })
    })
})

router.post('/pdf', async (req, res, next) => {
    var form = new IncomingForm();
    return form.parse(req, async (err, fields, files) => {
        let email = await db.pg('usuario').select('email').where('name', '=', fields.creator);
        utils.insertLogs(email[0].email, 'Carga de PDF');
        await parseParesaRecibos(fields, files.file.path, cbPages, () => {
            res.status(200).json({
                status: 'success'
            });
        });
    });
});

function createSheet(periodo, employees) {

    return new Promise(resolve => {

        // setup workbook and sheet
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet('Sheet');

        // Add a title row

        const rowOffset = periodo ? 1 : 0

        if (periodo) {
            ws.cell(1, 1)
                .string('Periodo: ' + periodo)
        }

        ws.cell(1 + rowOffset, 1)
            .string('Nombres')

        ws.cell(1 + rowOffset, 2)
            .string('Apellidos')

        ws.cell(1 + rowOffset, 3)
            .string('CI')

        ws.cell(1 + rowOffset, 4)
            .string('Legajo')

        ws.cell(1 + rowOffset, 5)
            .string('E-mail')

        // add data from json

        for (let i = 0; i < employees.length; i++) {

            let row = i + rowOffset + 2

            ws.cell(row, 1)
                .string(employees[i].nombres)

            ws.cell(row, 2)
                .string(employees[i].apellidos)

            ws.cell(row, 3)
                .string(employees[i].identification)

            ws.cell(row, 4)
                .string(employees[i].legajo)

            ws.cell(row, 5)
                .string(employees[i].email)
        }

        resolve(wb)

    })
}

router.get('/:id/unsigned-employees-excel', async (req, res, next) => {
    const xmls = await db.pg('xml')
        .select(
            'employee_id',
            'mes_de_pago'
        )
        .where('document_id', req.params.id)
        .where('signature_employee', false)

    const employees = await db.pg('employee')
        .whereIn('id', xmls.map(xml => xml.employee_id))
    let mesPago = xmls.length > 0 ? moment(xmls[0].mes_de_pago).format("MM/YYYY") : null

    createSheet(mesPago, employees).then(file => {
        if (!mesPago) {
            mesPago = moment().format('YYYYMM');
        }
        file.write(`Empleados-a-firmar-periodo-${mesPago.replace('/', '-')}.xlsx`, res);
    })
})

router.get('/:id/signed-employees-excel', async (req, res, next) => {
    const xmls = await db.pg('xml')
        .select(
            'employee_id',
            'mes_de_pago'
        )
        .where('document_id', req.params.id)
        .where('signature_employee', true)

    const employees = await db.pg('employee')
        .whereIn('id', xmls.map(xml => xml.employee_id))

    let mesPago = xmls.length > 0 ? moment(xmls[0].mes_de_pago).format("MM/YYYY") : null

    console.log(mesPago);
    createSheet(mesPago, employees).then((file, mesPago) => {
        if (!mesPago) {
            mesPago = moment().format('YYYYMM');
        }
        file.write(`Empleados-firmados-periodo-${mesPago.replace('/', '-')}.xlsx`, res);
    })

})

router.get('/hearder/:id', async (req, res, next) => {
    var header = await db.pg('document').where('id', '=', req.query.id).select('creator', 'start_date', 'end_date', 'created_at');
    return res.status(200).json({
        status: 'success',
        data: header
    })
})

async function textToDoc(content, fields) {
    content = content.replace(/[^\x00-\x7F]/g, "");
    const lines = content.split('\n').filter(e => e !== '')
    const header = lines.shift()
    const headerColumns = header.replace(/ /g, '').split(',')

    const startDateParts = fields.start_date.split('/')
    const endDateParts = fields.end_date.split('/')

    const resultStartDate = startDateParts[2] + "-" + startDateParts[0] + "-" + startDateParts[1]
    const resultEndDate = endDateParts[2] + "-" + endDateParts[0] + "-" + endDateParts[1]

    const newDocId = await db.pg('document')
        .insert({
            start_date: resultStartDate,
            end_date: resultEndDate,
            creator: fields.creator,
            status: 'PEN',
        })
        .returning('id')

    lines.forEach(async line => {
        const columns = line.split(',')

        const employee = await db.pg('employee')
            .where('identification', columns[headerColumns.indexOf('cedula')])

        const company = await db.pg('company')
        console.log('Company: ', company)

        let xmlId = null

        const existingXml = await db.pg('xml')
            .select('id')
            .where('mes_de_pago', columns[headerColumns.indexOf('mesDePago')])
            .where('employee_id', employee[0].id)

        if (existingXml.length > 0) {
            xmlId = existingXml[0].id
        } else {
            const newXmlId = await db.pg('xml')
                .insert({
                    document_id: newDocId[0],
                    employee_id: employee[0].id,
                    company_id: company[0].id,
                    mes_de_pago: columns[headerColumns.indexOf('mesDePago')],
                    total_ingresos: columns[headerColumns.indexOf('totalHaberes')],
                    total_ingresosno: columns[headerColumns.indexOf('totalHaberesno')],
                    total_retenciones: columns[headerColumns.indexOf('totalDescuentos')],
                    total_neto: columns[headerColumns.indexOf('netoACobrar')],
                    neto_en_letras: columns[headerColumns.indexOf('netoEnLetras')],
                    fecha_de_pago: columns[headerColumns.indexOf('fechaDePago')],
                    status: 'PEN',
                    observation: fields.observation,
                })
                .returning('id')

            xmlId = newXmlId[0]
        }

        return db.pg('xml_details')
            .insert({
                xml_id: xmlId,
                codigo: columns[headerColumns.indexOf('codConcepto')],
                descripcion: columns[headerColumns.indexOf('detalleDescripcion')],
                cant: columns[headerColumns.indexOf('cantidad')],
                ingresos: columns[headerColumns.indexOf('haberes')],
                retenciones: columns[headerColumns.indexOf('descuentos')],
                ingresosno: columns[headerColumns.indexOf('ingresosno')],
                unidade: columns[headerColumns.indexOf('unidade')],
            })
    })
}

router.post('/:id/deactivate', async (req, res, next) => {
    let email = await db.pg('usuario').select('email').where('email', '=', req.body.creator);
    utils.insertLogs(email[0].email, 'Motivo: ' + req.body.motivo_desactivacion, 'Desactivación de documento', 'INFO');
    return db.pg.update({
        status: 'DES',
        motivo_desactivacion: req.body.motivo_desactivacion,
    })
        .table('document')
        .where('id', req.params.id)
        .then(() =>
            db.pg('xml')
                .whereIn('id', function () { return this.select('document_id').from('document').where('id', req.params.id) })
                .update({
                    status: 'DES',
                    motivo_desactivacion: req.body.motivo_desactivacion,
                })
        )
        .then(() => {
            return res.status(200).json({
                status: 'ok'
            });
        })
        .catch(e => {
            console.log('ERROR DEACTIVATING DOC: ', e)
            return res.status(200).json({
                status: 'error',
                data: e
            })
        })
})

router.get('/download', async (req, res, next) => {

    const zip = new JSZip()

    await db.pg("xml")
        .where("document_id", 'like', `%${req.query.id}%`)
        .then(xmls => {
            console.log(xmls)
            xmls.forEach(xml => {
                zip.file(`${xml.hash_kude}.xml`, xml.xml)
            })
        })
    res.attachment('documentos.zip')

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: false })
        .pipe(res)
});

function createSheetLog(periodo, xmls) {

    return new Promise(resolve => {

        // setup workbook and sheet
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet('Sheet');

        // Add a title row

        const rowOffset = periodo ? 1 : 0

        if (periodo) {
            ws.cell(1, 1)
                .string('Periodo: ' + moment(periodo, 'MM/YYYY').startOf('month').format('DD/MM/YYYY'))
        }

        ws.cell(1 + rowOffset, 1)
            .string('CI')

        ws.cell(1 + rowOffset, 2)
            .string('Legajo')

        ws.cell(1 + rowOffset, 3)
            .string('Nro Recibo')
        // add data from json

        for (let i = 0; i < xmls.length; i++) {

            let row = i + rowOffset + 2

            ws.cell(row, 1)
                .string(xmls[i].identificacion)

            ws.cell(row, 2)
                .string(xmls[i].legajo)

            ws.cell(row, 3)
                .string(xmls[i].numero_recibo)
        }

        resolve(wb)

    })
}

router.get('/problem-employees-excel', async (req, res, next) => {
    const mesPago = moment(req.query.fecha, 'MM/YYYY').startOf('month').format('YYYY-MM-DD')
    const xmls = await db.pg('reject_load').where('mes_de_pago', '=', mesPago);
    createSheetLog(req.query.fecha, xmls).then(file => {
        file.write(`Problemas-en-carga-${req.query.fecha.replace('/', '-')}.xlsx`, res);
    })
})

async function cbPages(pages, pagesComprobantes, cb) {
    //var i = 0;

    var processedPages = { "paginas": [] };

    pages.forEach(page => {
        //eyes.inspect("Página #" + ++i);

        var rows = [];
        page.rows.forEach(row => {
            rows.push({
                "dsHs": row.ds_hs,
                "conceptos": row.conceptos,
                "unidades": row.unidades,
                "haberesImponibles": row.haberes_imponibles,
                "haberesNoImponibles": row.haberes_no_imponibles,
                "descuentos": row.descuentos
            });
        });

        var processedPage = {
            "legajo": page.legajo,
            "periodo": page.periodo,
            "fechaInicio": page.start_date,
            "fechaFin": page.end_date,
            "creador": page.creator,
            "observacion": page.observation,
            "fechaDePago": page.fecha_de_pago,
            "totalesHaberesImponibles": page.totales_haberes_imponibles,
            "totalesHaberesNoImponibles": page.totales_haberes_no_imponibles,
            "totalesDescuentos": page.totales_descuentos,
            "netoAPagar": page.neto_a_pagar,
            "netoEnLetras": page.neto_en_letras,
            "lineas": rows
        }

        console.log('processedPage: ', processedPages)

        processedPages.paginas.push(processedPage);
    });

    let docId = null

    let post = bent('POST', 'json', 200);

    for (const page of processedPages.paginas) {
        const data = {
            paginas: [page],
            id: docId
        }

        const res = await post(process.env.REACT_APP_DOTNET_API_HOST + '/api/pdf/IncluirRecibo', data)
        if (res) {
            docId = res
        }
    }

    // START COMPROBANTES

    processedPages = { "paginas": [] };

    pagesComprobantes.forEach(page => {
        //eyes.inspect("Página #" + ++i);

        var rows = [];
        page.rows.forEach(row => {
            rows.push({
                "conceptos": row.conceptos,
                "unidades": row.unidades,
                "importeAAbonar": row.importe_a_abonar
            });
        });

        var processedPage = {
            "legajo": page.legajo,
            "periodo": page.periodo,
            "fechaInicio": page.start_date,
            "fechaFin": page.end_date,
            "fechaDePago": page.fecha_de_pago,
            "creador": page.creator,
            "observacion": page.observation,
            "totalAAbonar": page.total_a_abonar,
            "lineas": rows
        }

        console.log('processedPage Comp: ', processedPage)

        processedPages.paginas.push(processedPage);
    });

    post = bent('POST', 'json', 200);

    for (const page of processedPages.paginas) {
        const data = {
            paginas: [page],
            id: docId
        }

        const res = await post(process.env.REACT_APP_DOTNET_API_HOST + '/api/pdfcomprobante/IncluirComprobante', data)
        if (res) {
            docId = res
        }
    }

    // END COMPROBANTES

    cb()
}

const chargeEmployee = (row) => {
    return Promise.resolve(db.pg('employee')
        .where({ legajo: row.legajo })
        .then((value) => {
            if (value.length == 0) {
                var data = {
                    identificacion: '',
                    mes_de_pago: row.fecha_de_pago,
                    numero_recibo: '',
                    legajo: row.legajo,
                };
                utils.rejectLoad(data);
                return true
            } else {
                return false
            }
        })
    )
}

const chargeEquival = () => {

}

async function parseParesaRecibos(fields, fileName, cb, onResultCb) {
    const rawPages = []

    fs.readFile(fileName, (err, pdfBuffer) => {
        // pdfBuffer contains the file content
        new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {

            if (!item) {
                // console.log('rawpages: ', rawPages)
                const liquidaciones = rawPages.filter(page => page.type == 'liquidacion')
                const comprobantes = rawPages.filter(page => page.type == 'comprobante')
                const error = []
                const items = []

                liquidaciones.forEach(page => {
                    items.push({
                        page: page.page,
                        start_date: fields.start_date,
                        end_date: fields.end_date,
                        creator: fields.creator,
                        fecha_de_pago: fields.fecha_de_pago,
                        mes_de_pago: fields.fecha_de_pago,
                        observation: fields.observation,
                        legajo: '',
                        periodo: fields.fecha_de_pago,
                        ds_hs: [],
                        conceptos: [],
                        unidades: [],
                        haberes_imponibles: [],
                        haberes_no_imponibles: [],
                        descuentos: [],
                        rows: [],
                        totales_haberes_imponibles: '',
                        totales_haberes_no_imponibles: '',
                        totales_descuentos: '',
                        neto_a_pagar: '',
                        liquidacion: false,
                        comprobante: false,
                    })
                    page.rows.forEach(async item => {
                        const row = items[items.length - 1];
                        if (item.y > 6 && item.y < 7) {
                            if (item.x > 13.1 && item.x < 20.3 && item.text.indexOf('/') != -1) {
                                // console.log('Periodo: ', item.text)
                                // PERIODO
                                row.periodo = item.text
                            }
                        }
                        if (item.y > 6 && item.y < 7) {
                            if (item.x > 3 && item.x < 4) {
                                // LEGAJO
                                row.legajo = item.text
                                if (chargeEmployee(row)) {
                                    error.push({ legajo: row.legajo })
                                }
                            }
                        }
                        if (item.y > 9.9 && item.y < 26) {
                            if (item.x > 2.5 && item.x < 25) {
                                if (item.x < 4.2) {
                                    // DS/HS
                                    row.ds_hs.push(item)
                                }
                                if (item.x > 4.2 && item.x < 10.5) {
                                    // Conceptos
                                    row.conceptos.push(item)
                                }
                                if (item.x > 10.5 && item.x < 13.1) {
                                    // Unidades
                                    row.unidades.push(item)
                                }
                                if (item.x > 13.1 && item.x < 16.8) {
                                    // Haberes Imponibles
                                    row.haberes_imponibles.push(item)
                                }
                                if (item.x > 16.8 && item.x < 20.3) {
                                    // Haberes no Imponibles
                                    row.haberes_no_imponibles.push(item)
                                }
                                if (item.x > 20.3) {
                                    // Descuentos
                                    row.descuentos.push(item)
                                }
                                const rowY = item.y.toFixed(2)
                                if (row.rows.indexOf(rowY) == -1) {
                                    row.rows.push(rowY)
                                }
                            }
                        }
                        if (item.y > 26 && item.y < 27.5) {
                            if (item.x > 2.5 && item.x < 25) {
                                if (item.x > 13.1 && item.x < 16.8) {
                                    // Haberes Imponibles
                                    row.totales_haberes_imponibles = item.text
                                }
                                if (item.x > 16.8 && item.x < 20.3) {
                                    // Haberes no Imponibles
                                    row.totales_haberes_no_imponibles = item.text
                                }
                                if (item.x > 20.3) {
                                    // Descuentos
                                    row.totales_descuentos = item.text
                                }
                            }
                        }
                        if (item.y > 27.5 && item.y < 28.4) {
                            if (item.x > 20.3 && item.x < 25) {
                                // Descuentos
                                row.neto_a_pagar = item.text
                            }
                        }
                    })
                })

                const pages = items.map(page => {
                    const table = []
                    //eyes.inspect(page);
                    page.rows.forEach(row => {
                        table.push({
                            ds_hs: '',
                            conceptos: '',
                            unidades: '',
                            haberes_imponibles: '',
                            haberes_no_imponibles: '',
                            descuentos: '',
                            rows: ''
                        })
                    })
                    page.ds_hs.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].ds_hs += (table[index].ds_hs.length > 0 ? ' ' : '') + data.text
                    })
                    page.conceptos.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].conceptos += (table[index].conceptos.length > 0 ? ' ' : '') + data.text
                    })
                    page.unidades.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].unidades += (table[index].unidades.length > 0 ? ' ' : '') + data.text
                    })
                    page.haberes_imponibles.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].haberes_imponibles += (table[index].haberes_imponibles.length > 0 ? ' ' : '') + data.text
                    })
                    page.haberes_no_imponibles.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].haberes_no_imponibles += (table[index].haberes_no_imponibles.length > 0 ? ' ' : '') + data.text
                    })
                    page.descuentos.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].descuentos += (table[index].descuentos.length > 0 ? ' ' : '') + data.text
                    })
                    return {
                        rows: table.map(page => {
                            page.haberes_no_imponibles = page.haberes_no_imponibles.replace(/\./g, '')
                            page.haberes_imponibles = page.haberes_imponibles.replace(/\./g, '')
                            page.descuentos = page.descuentos.replace(/\./g, '')
                            page.unidades = page.unidades.replace(/\./g, '')
                            return page
                        }),
                        start_date: fields.start_date,
                        end_date: fields.end_date,
                        creator: fields.creator,
                        observation: fields.observation,
                        fecha_de_pago: fields.fecha_de_pago,
                        legajo: page.legajo,
                        periodo: page.periodo,
                        totales_haberes_imponibles: page.totales_haberes_imponibles.replace(/\./g, ''),
                        totales_haberes_no_imponibles: page.totales_haberes_no_imponibles.replace(/\./g, ''),
                        totales_descuentos: page.totales_descuentos.replace(/\./g, ''),
                        neto_a_pagar: page.neto_a_pagar.replace(/\./g, ''),
                        neto_en_letras: numeroALetras(page.neto_a_pagar.replace(/\./g, ''))
                            .replace('MILLONES DE', 'MILLONES')
                            .replace('MILLON DE', 'MILLON'),
                    }
                })

                // START COMPROBANTES

                const itemsComprobantes = []

                comprobantes.forEach(page => {
                    itemsComprobantes.push({
                        page: page.page,
                        start_date: fields.start_date,
                        end_date: fields.end_date,
                        fecha_de_pago: fields.fecha_de_pago,
                        creator: fields.creator,
                        observation: fields.observation,
                        legajo: '',
                        periodo: '',
                        conceptos: [],
                        unidades: [],
                        importe_a_abonar: [],
                        rows: [],
                        total_a_abonar: '',
                        neto_a_pagar: '',
                    })
                    page.rows.forEach(item => {
                        const row = itemsComprobantes[itemsComprobantes.length - 1];
                        // if (item.text.indexOf('LEGAJO') != -1) {
                        //     console.log(item)
                        // }
                        if (item.y > 6 && item.y < 7) {
                            if (item.x > 13.1 && item.x < 20.3 && item.text.indexOf('/') != -1) {
                                // PERIODO
                                row.periodo = item.text
                            }
                        }
                        if (item.y > 6 && item.y < 7) {
                            if (item.x > 12 && item.x < 13.1) {
                                // LEGAJO
                                row.legajo = item.text
                            }
                        }
                        if (item.y > 9.9 && item.y < 26) {
                            if (item.x > 2.5 && item.x < 25) {
                                if (item.x < 4.2 && item.x < 13.1) {
                                    // Conceptos
                                    row.conceptos.push(item)
                                }
                                if (item.x > 13.1 && item.x < 16.8) {
                                    // Unidades
                                    row.unidades.push(item)
                                }
                                if (item.x > 16.8) {
                                    // importe_a_abonar
                                    row.importe_a_abonar.push(item)
                                }

                                const rowY = item.y.toFixed(2)
                                if (row.rows.indexOf(rowY) == -1) {
                                    row.rows.push(rowY)
                                }
                            }
                        }
                        if (item.y > 28 && item.y < 29) {
                            if (item.x > 2.5 && item.x < 25) {
                                if (item.x > 16.8) {
                                    // total_a_abonar
                                    row.total_a_abonar = item.text
                                }
                            }
                        }
                    })
                })

                const pagesComprobantes = itemsComprobantes.map(page => {
                    const table = []
                    //eyes.inspect(page);
                    page.rows.forEach(row => {
                        table.push({
                            conceptos: '',
                            unidades: '',
                            importe_a_abonar: '',
                            rows: ''
                        })
                    })
                    page.conceptos.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].conceptos += (table[index].conceptos.length > 0 ? ' ' : '') + data.text
                    })
                    page.unidades.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].unidades += (table[index].unidades.length > 0 ? ' ' : '') + data.text
                    })
                    page.importe_a_abonar.forEach(data => {
                        const rowY = data.y.toFixed(2)
                        const index = page.rows.indexOf(rowY)
                        table[index].importe_a_abonar += (table[index].importe_a_abonar.length > 0 ? ' ' : '') + data.text
                    })

                    return {
                        rows: table.map(page => {
                            page.importe_a_abonar = page.importe_a_abonar.replace(/\./g, '')
                            page.unidades = page.unidades.replace(/\,/g, '.')
                            return page
                        }),
                        start_date: fields.start_date,
                        end_date: fields.end_date,
                        fecha_de_pago: fields.fecha_de_pago,
                        creator: fields.creator,
                        observation: fields.observation,
                        legajo: page.legajo,
                        periodo: page.periodo,
                        total_a_abonar: page.total_a_abonar.replace(/\./g, ''),
                        neto_en_letras: numeroALetras(page.total_a_abonar.replace(/\./g, ''))
                            .replace('MILLONES DE', 'MILLONES')
                            .replace('MILLON DE', 'MILLON'),
                    }
                })
                // END  COMPROBANTES
                cb(pages, pagesComprobantes, onResultCb)
                return
            }
            if (item.page) {
                rawPages.push({
                    page: item.page,
                    type: '',
                    rows: []
                });
            }
            if (item.text) {
                rawPages[rawPages.length - 1].rows.push(item)


                if (item.text == 'Liquidación') {
                    rawPages[rawPages.length - 1].type = 'liquidacion'
                    // row.liquidacion = true
                }
                if (item.text == 'COMPROBANTE') {
                    rawPages[rawPages.length - 1].type = 'comprobante'
                    // row.comprobante = true
                }
            }
        });
    });
}

router.get('/notificaciones-excel', async (req, res, next) => {
    const xmls = await db.pg('xml_notificaciones')
        .select(
            'employee_id',
            'fecha',
            'titulo',
            'signature_employee'
        )

    const employees = await db.pg('employee')
        .whereIn('id', xmls.map(xml => xml.employee_id))
        .select(
            'id',
            'nombres',
            'apellidos',
            'identification',
            'legajo'
        )
    var objects = Array();
    for (var i = 0; i < xmls.length; i++) {
        for (var h = 0; h < employees.length; h++) {
            if (xmls[i].employee_id == employees[h].id) {
                objects[i] = {
                    nombres: employees[h].nombres,
                    apellidos: employees[h].apellidos,
                    identification: employees[h].identification,
                    legajo: employees[h].legajo,
                    fecha: xmls[i].fecha,
                    titulo: xmls[i].titulo,
                    signature_employee: xmls[i].signature_employee
                }
            }
        }
    }


    var titulo = 'notificaciones-firma';
    createSheetNotificacion(titulo, objects).then((file, titulo) => {
        var titulo = 'notificaciones-firma';
        file.write(titulo + '.xlsx', res);
    })

})

function createSheetNotificacion(titulo, employees) {

    return new Promise(resolve => {

        // setup workbook and sheet
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet('Sheet');

        // Add a title row

        const rowOffset = 0;

        ws.cell(1 + rowOffset, 1)
            .string('Nombres')

        ws.cell(1 + rowOffset, 2)
            .string('Apellidos')

        ws.cell(1 + rowOffset, 3)
            .string('CI')

        ws.cell(1 + rowOffset, 4)
            .string('Legajo')

        ws.cell(1 + rowOffset, 5)
            .string('Fecha')

        ws.cell(1 + rowOffset, 6)
            .string('Titulo')

        ws.cell(1 + rowOffset, 7)
            .string('Firmado')
        // add data from json

        for (let i = 0; i < employees.length; i++) {

            let row = i + rowOffset + 2

            ws.cell(row, 1)
                .string(employees[i].nombres)

            ws.cell(row, 2)
                .string(employees[i].apellidos)

            ws.cell(row, 3)
                .string(employees[i].identification)

            ws.cell(row, 4)
                .string(employees[i].legajo)

            var fecha = moment(employees[i].fecha).format("MM/DD/YYYY").toString();
            ws.cell(row, 5)
                .string(fecha)

            ws.cell(row, 6)
                .string(employees[i].titulo)

            if (employees[i].signature_employee) {
                ws.cell(row, 7)
                    .string('Firmado')
            } else {
                ws.cell(row, 7)
                    .string('No Firmado')
            }
        }

        resolve(wb)

    })
}

router.get('/cantdoc', async (req, res, next) => {
    var result = await db.pg('document').count('id');
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

router.get('/cantdoccom', async (req, res, next) => {
    var result = await db.pg('document').count('id').where('status', '=', 'COM');
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

router.get('/cantdocenp', async (req, res, next) => {
    var result = await db.pg('document').count('id').where('status', '=', 'ENP');
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

router.get('/cantdocpen', async (req, res, next) => {
    var result = await db.pg('document').count('id').where('status', '=', 'PEN');
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

router.get('/xml', async (req, res, next) => {
    var result = await db.pg('xml').count('id');
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

router.get('/xmlfir', async (req, res, next) => {
    var result = await db.pg('xml').count('id').where('signature_employee', true);
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

router.get('/xmlnofir', async (req, res, next) => {
    var result = await db.pg('xml').count('id').where('signature_employee', '<>', true);
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


router.get('/xmlmtess', async (req, res, next) => {
    var result = await db.pg('xml').count('id').where('envio_mtess', true);
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

router.get('/sendrecordmail', async (req, res, next) => {
    var result = await db.pg('xml').where('signature_employee', false).distinct('employee_id');
    var company = await db.pg('company').select('razon_social');
    for (var i = 0; i < result.length; i++) {
        db.pg('employee').where('id', '=', result[i].employee_id).then(async (employee) => {
            data = employee[0];
            let to = data.email; // 'andre.santos@digitalife.com.py';
            let toName = data.nombres + " " + data.apellidos;
            const messages = await db.pg('email_config')
                .where('slug', 'notification-reminder-employee')
            var html = '';
            if (messages.length > 0) {
                html = '<h3>Hola ' + toName + '!</h3> ' + messages[0].message;
            } else {
                html = `<h3>Hola ${toName}<h3><p>El Departamento de Recursos Humanos le recuerda que tiene documentos pendientes de firma en su bandeja de Documentos Laborales Electrónicos.</p><p>Restan 12 horas para regularizar el estado.</p><p>Atentamente.</p>`;
            }

            let email = {
                from: company[0].razon_social,
                to: to,
                toName: toName,
                subject: 'Mensaje recordatorio de firma',
                html: html,
                id_plantilla: process.env.EMAIL_WS_AVISO_FIRMA
            };
            // return await axios.post('https://dataflow.code100sa.com.py/api/email/send', email)
            let control = await db.pg('control');
            if (control[0].ext_email) {
                return await utils.sendMailExt(email);
            } else {
                return await utils.sendMail(email);
            }
        })
    }
})

module.exports = router;