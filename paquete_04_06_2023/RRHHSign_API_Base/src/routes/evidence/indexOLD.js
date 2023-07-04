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

router.post("/", async function (req, res, next) {

	var form = new IncomingForm();
	return form.parse(req, (err, fields, files) => {
		let timestamp = Date.now();
		let oldpath = files.file.path;
		let extension = getFileExtension(files.file.type);
		if (extension === false) { res.send({ status: 'error', message: 'Invalid mime type' }); return; }
		let newpath = `./src/documents/${utils.simpleRandomHash(10)}_${timestamp}${extension}`;

		fs.rename(oldpath, newpath, (err) => {
			if (err) {
				res.send({ status: 'error', message: 'Invalid information sent to the API' });
				return;
			}

			fs.readFile(newpath, { encoding: 'utf-8' }, async function (err, data) {
				if (!err) {
					var workbook = XLSX.read(newpath, { type: 'file', bookType: "xlss" });
					var sheet1 = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

					//INSERE DOCUMENT AQUI
					var document = await db.pg.select("*")
						.table("documents")
						.where("identificator", fields.identificator)
						.then(async documents => {
							console.log("DOC LENGTH: " + documents.length);
							if (documents.length === 0) {
								return await db.pg.insert({
									identificator: fields.identificator,
									start_pay_date: fields.start_pay_date,
									end_pay_date: fields.end_pay_date
								})
									.table("documents")
									.returning("*")
									.then(documents => {
										return documents[0];
									})
									.catch(e => {
										console.log('ERROR INSERTING DOCUMENT: ' + e);
										return null;
									});
							} else {
								return documents[0];
							}
						});

					sheet1.map(value => {
						InsertDetails(value, document);
					});

					return res.status(200).json({
						status: 'success',
						data: {
							message: 'File uploaded with success'
						}
					});
				} else {
					return res.status(200).json({
						status: 'error',
						data: {
							message: 'Error uploading the file'
						}
					});
				}
			});
		});

		form.on("end", () => {
			return res.status(200).send({ data: "success", message: "success" });
		});
	});
});

function SaveEmployee(employee) {
	db.pg.insert(employee)
		.table('employee')
		.returning("*")
		.then((employees) => {
			//RETORNAR O USUÁRIO
		})
		.catch(e => {
			//RETORNAR ERRO TRATADO
		});
}

function getFileExtension(fileType) {
	switch (fileType) {
		case 'application/vnd.ms-excel':
			return '.xls'
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
			return '.xlsx'
		case 'text/csv':
			return '.csv'
		default:
			return false;
	}
}

function getJsDateFromExcel(excelDate) {

	// JavaScript dates can be constructed by passing milliseconds
	// since the Unix epoch (January 1, 1970) example: new Date(12312512312);

	// 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")             
	// 2. Convert to milliseconds.

	return new Date((excelDate - (25567 + 1)) * 86400 * 1000);

}

async function InsertDetails(value, document) {
	console.log('VALUE: ' + JSON.stringify(value));
	console.log('DOCUMENT: ' + JSON.stringify(document));

	var fechaDePago = await getJsDateFromExcel(value.fechaDePago);
	var mesDePago = await getJsDateFromExcel(value.mesDePago);

	//Verifica se já tem um empregado para o email informado
	return await db.pg.select('*').table('employees').where('identification', value.cedula)
		.then((employees) => {
			if (employees.length > 0) {
				//INSERE DOCUMENTS_DETAILS AQUI
				console.log('INSERINDO DETALHES');
				db.pg.insert({
					document_id: document.id,
					employee_id: employees[0].id,
					sueldo_jornal: value.sueldoJornal,
					cantidad: value.cantidad,
					descuentos: value.descuentos,
					haberes: value.haberes,
					detalles_descripcion: value.detalleDescripcion,
					total_haberes: value.totalHaberes,
					total_descuentos: value.totalDescuentos,
					neto_a_cobrar: value.netoACobrar,
					neto_en_letras: value.netoEnLetras,
					fecha_de_pago: moment(fechaDePago).local(momentESLocale).format("MM/DD/YYYY"),
					mes_de_pago: moment(mesDePago).local(momentESLocale).format("MM/DD/YYYY"),
					cod_concepto: value.codConcepto
				})
					.table('documents_details')
					.returning("*")
					.then(details => {
						CreateXML(document, details[0]);
						return details[0];
					})
					.catch(e => {
						console.log('ERROR INSERTING DETAILS: ' + e);
					});
			} else {
				console.log('NÃO ACHOU FUNCIONÁRIOS');
				//TODO: IMPLEMENTAR ESSA PARTE DEPOIS DA APRESENTAÇÃO
				//Se não tiver, cria um novo usuário e empregado
				/*db.pg.select('id').table('user_profile').where('profile_slug', 'employee')
					.then((profile) => {
						return db.pg.insert(
							{
								name: value.nombre,
								email: value.email,
								password: utils.cryptPasswordSync(password),
								avatar: 'default.jpg',
								profile_id: profile[0].id
							}
						).table('usuario')
						.returning('*')
							.then((users) => {
								var employee = {
									name: value.name,
									email: value.email,
									identification: value.identification,
									user_id: users[0].id,
								};

								if (users.length > 0) {
									//INSERE EMPREGADO E DEPOIS INSERE DOCUMENTO
									return SaveEmployee(employee);
								} else {
									console.log('Erro ao retornar usuário incluído' + err);
								}
							})
							.catch((err) => {
								console.log('Erro ao incluir usuário: 2' + err);
							});
					})
					.catch((err) => {
						console.log('Erro ao incluir usuário: 1' + err);
					});*/
			}
		})
		.catch((err) => {
			console.log('Erro ao selecionar usuário: 1' + err);
		});
}

async function CreateXML(document) {

	var company = await GetCompany();
	
	return db.pg.select("*")
		.table("documents_details")
		.join("documents", "documents.id", "documents_details.document_id")
		.where("documents.id", document.id)
		.where("documents_details.document_id", document.id)
		.then(async results => {
			//eyes('COMPANY: ' + JSON.stringify(company));
			//eyes('RESULTS JOIN: ' + JSON.stringify(results));

			var employee = await GetEmployee(results[0]);

			var details = results.map(result => {
				return {
					detalle_item: {
						codigo: {
							'#text': result.cod_concepto
						},
						descripcion: {
							'#text': result.detalles_descripcion
						},
						cant: {
							'#text': result.cantidad
						},
						ingresos: {
							'#text': result.haberes
						},
						retenciones: {
							'#text': result.descuentos
						}
					}
				}
			});

			var xmlObj = {
				recibo: {
					'@id': 'recibo',
					encabezado: {
						razonSocial: {
							'#text': company.name
						},
						ruc: {
							'#text': company.ruc
						},
						nroIPSPatronal: {
							'#text': company.ips_patronal
						},
						dpto: {
							'#text': "--"
						},
						legajo: {
							'#text': "1"
						},
						categoria: {
							'#text': "--"
						},
						apellidos: {
							'#text': employee.name
						},
						nombres: {
							'#text': employee.name
						},
						sueldoJornal: {
							'#text': results[0].sueldoJornal
						},
						nroIPSEmpleado: {
							'#text': employee.ips_empleado
						},
						ciNro: {
							'#text': employee.identification
						},
						fechaIngreso: {
							'#text': employee.start_date
						},
						mesDePago: {
							'#text': moment(results[0].mes_de_pago).format('DD/MM/YYYY')
						},
					},
					detalles: {
						details
					},
					pie: {
						totalIngresos: {
							'#text': results[0].total_haberes
						},
						totalRetenciones: {
							'#text': results[0].total_descuentos
						},
						totalDescuentos: {
							'#text': results[0].neto_a_cobrar
						},
						netoEnLetras: {
							'#text': results[0].neto_en_letras
						},
						fechaDePago: {
							'#text': moment(results[0].fecha_de_pago).format('DD/MM/YYYY')
						}
					},
					SignatureDIRECTOR: {

					},
					SignatureRRHH: {

					},
					SignatureEMPLEADO: {

					}
				}
			}

			var xml = XmlBuilder.create(xmlObj).end({ pretty: true });

			console.log(xml); 
		})
		.catch(e => {
			console.log("ERRO JOIN: " + e)
		});
}

function GetCompany() {
	return db.pg.select("*")
		.table("companies")
		.then(companies => {
			return companies[0];
		});
}

function GetEmployee(detail) {
	return db.pg.select("*")
		.table("employees")
		.where("id", detail.employee_id)
		.then(employees => {
			return employees[0];
		});
}

module.exports = router;