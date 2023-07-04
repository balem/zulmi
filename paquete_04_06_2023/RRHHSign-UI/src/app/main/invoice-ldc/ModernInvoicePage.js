import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon, Grid } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { makeStyles } from '@material-ui/styles';
import aes256 from 'aes256';
import { useSelector } from 'react-redux';
import EmployeeService from '../../services/EmployeeService/index';
import CompanyService from '../../services/CompanyService/index';
import PatronalService from '../../services/PatronalService/index';
import SignatureService from '../../services/SignatureService/index';
import XmlService from '../../services/XmlService/index';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import renderIf from "../Utils/renderIf";
import { numeroALetras } from "../Utils/numeroALetras";

import QRCode from 'qrcode.react';
import MessageService from 'app/services/MessageService';
import QuejaService from 'app/services/QuejaService';
import ModernInvoicePageAguinaldo from '../invoice-format-ldc/ModernInvoicePageAguinaldo';
import ModernInvoicePagePago from '../invoice-format-ldc/ModernInvoicePagePago';
import ModernInvoicePageVacaciones from '../invoice-format-ldc/MoernInvoicePageVacaciones';
import ControlService from 'app/services/ControlService';
import { result } from 'lodash';

const useStyles = makeStyles(theme => ({
    root: {
        background: 'radial-gradient(' + darken(theme.palette.primary.dark, 0.5) + ' 0%, ' + theme.palette.primary.dark + ' 80%)'
    },
    divider: {
        backgroundColor: theme.palette.divider
    }
}));


function ModernInvoicePage(props) {
    const classes = useStyles();
    const dispatchMsg = useDispatch();

    const [open, setOpen] = useState(false);
    const [pin, handlePin] = useState('');
    const [xmlId, handleXmlId] = useState(props.match.params.id);
    const [xml, handleXml] = useState([]);
    const [xmlDetails, handleXmlDetails] = useState([]);
    const [firmas, handleFirmas] = useState([]);
    const [firmasHolografas, handleFirmasHolografas] = useState([]);
    const [hashKude, setHashKude] = useState("");
    const [qrCode, handleQRCode] = useState(false);
    const [rejections, handleRejections] = useState([]);
    const [rejectionMessage, handleRejectionMessage] = useState();
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [motivoDesactivacion, handleMotivoDesactivacion] = useState();
    const [supportOpen, setSupportOpen] = useState(false);
    const [queja, handleQueja] = useState();
    const [firmasView, handleFirmasView] = useState({});
    const [company, handleCompany] = useState({});
    const [patronal, handlePatronal] = useState([]);
    const [employee, handleEmployee] = useState({});

    const [buttonFirmar, toggleButtonFirmar] = useState("disabled");

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let username = user.data.email.split("@", 2);
    username = username[0];
    let userProfile = user.role[0];

    //console.log(user);

    const formatter = new Intl.NumberFormat('es-PY',
        {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }
    );

    const decimalFormatter = new Intl.NumberFormat('es-PY',
        {
            style: 'decimal',
            minimumFractionDigits: 0
        }
    );

    const decimalFormatterFormat = val => val == 0 ? '' : decimalFormatter.format(val)

    const ipsFormatter = val => {
        let str = String(val)
        return str.substr(0, 4) + '-'
        + str.substr(4, 2) + '-'
        + str.substr(6)
    }

    async function LoadRejections() {
        const rejections = await XmlService.getRejections(xmlId)
        if (rejections.data.status == 'success') {
            handleRejections(rejections.data.data)
        }
    }

    async function LoadXML() {
        let responseXML = await XmlService.getXmlById(xmlId);
        let sign = await ControlService.getControlSigners();
        if (responseXML.status === 200) {
            setHashKude(responseXML.data[0].xml.hashKude);

            var processedXML = {
                fecha_de_pago: responseXML.data[0].xml.fechaDePago,
                mes_de_pago: responseXML.data[0].xml.mesDePago,
                total_ingresos: responseXML.data[0].xml.totalIngresos,
                total_ingresos_no: responseXML.data[0].xml.totalIngresosNo,
                total_retenciones: responseXML.data[0].xml.totalRetenciones,
                total_neto: responseXML.data[0].xml.totalNeto,
                neto_en_letras: responseXML.data[0].xml.netoEnLetras,
                status: responseXML.data[0].xml.status,
                observation: responseXML.data[0].xml.observation,
                periodo: responseXML.data[0].xml.periodo,
                motivoDesactivacion: responseXML.data[0].xml.motivoDesactivacion,
                numero_recibo: responseXML.data[0].xml.numeroRecibo,
                identificator: responseXML.data[0].xml.identificator
            }

            const firmas = {
                rrhh: responseXML.data[0].xml.signatureRRHH === true ? "Firmado: " + moment(responseXML.data[0].xml.signatureRRHHDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].xml.signatureRRHHName : "No Firmado",
                director: responseXML.data[0].xml.signatureDirector === true ? "Firmado: " + moment(responseXML.data[0].xml.signatureDirectorDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].xml.signatureDirectorName : "No Firmado",
                empleado: responseXML.data[0].xml.signatureEmployee === true ? "Firmado: " + moment(responseXML.data[0].xml.signatureEmployeeDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].xml.signatureEmployeeName : "No Firmado",
            }

            let firmasHolografas = {
                rrhh: responseXML.data[0].xml.signatureRRHHHolograph,
                director: responseXML.data[0].xml.signatureDirectorHolograph,
                empleado: responseXML.data[0].xml.signatureEmployeeHolograph,
            }

            let firmasView = {
                rrhh_view: false,
                director_view: false,
                empleado_view: false
            }

            for (let i = 0; i < sign.data.data.length; i++) {
                if (sign.data.data[i].sign_name == 'Funcionario') {
                    firmasView.empleado_view = true;
                }
                if (sign.data.data[i].sign_name == 'Director') {
                    firmasView.director_view = true;
                }
                if (sign.data.data[i].sign_name == 'RH') {
                    firmasView.rrhh_view = true;
                }
            }

            if (user.role[0] === "director") {
                //
            }

            //HABILITA OU DESABILITA O BOTÃO DE FIRMAR
            if (user.role[0] === "director" && responseXML.data[0].xml.signatureRRHH !== true) {
                toggleButtonFirmar("disabled");
            } else if (user.role[0] === "funcionario" && responseXML.data[0].xml.signatureRRHH !== true && responseXML.data[0].xml.signatureDirector !== true) {
                toggleButtonFirmar("disabled");
            } else if (responseXML.data[0].xml.signatureRRHH === true && user.role[0] === "rh") {
                toggleButtonFirmar("disabled");
            } else if (responseXML.data[0].xml.signatureDirector === true && user.role[0] === "director") {
                toggleButtonFirmar("disabled");
            } else if (responseXML.data[0].xml.signatureEmployee === true && user.role[0] === "funcionario") {
                toggleButtonFirmar("disabled");
            } else if (user.role[0] !== "rh" && user.role[0] !== "director" && user.role[0] !== "funcionario") {
                toggleButtonFirmar("disabled");
            } else {
                toggleButtonFirmar("");
            }

            //HABILITA OU DESABILITA O QRCODE
            if (responseXML.data[0].xml.signatureRRHH === true && responseXML.data[0].xml.signatureDirector === true && responseXML.data[0].xml.signatureEmployee === true) {
                handleQRCode(true);
            }

            handleXml(processedXML);
            handleFirmas(firmas);
            handleFirmasHolografas(firmasHolografas);
            handleFirmasView(firmasView);
        } else {
            message('error', responseXML.data)
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        let localEmployee
        async function LoadCompany(mtess) {
            let responseCompany = await CompanyService.getCompanyMTESS(mtess);
            let responsePatronal = await PatronalService.getPatronalByCompany(responseCompany.data.data[0].id);
            if (responsePatronal) {
                const patro = responsePatronal.data
                let responseDirector = await EmployeeService.getDirector();
                let employeePatronal = '';
                if (employeePatronal) {
                    employeePatronal = responsePatronal.data.data[0].mtess_patronal
                }
                console.log('emple: ', localEmployee)
                console.log('employeePatronal: ', employeePatronal)
                if (responseCompany.status === 200) {
                    var processedCompany = {
                        razon_social: (employeePatronal && employeePatronal.razonSocial) ? employeePatronal.razonSocial : responseCompany.data.data[0].razon_social,
                        ruc: (employeePatronal && employeePatronal.ruc) ? employeePatronal.ruc : responseCompany.data.data[0].ruc,
                        ips: (employeePatronal && employeePatronal.ipsPatronal) ? employeePatronal.ipsPatronal : responseCompany.data.data[0].ips_patronal,
                        mtess_patronal: localEmployee.mtess_patronal,
                        director: responseDirector.name,
                        website: "" //responseCompany.data[0].company.website
                    }
                    handleCompany(processedCompany);
                } else {
                    message('error', 'Registro de la empresa no encontrado')
                }
            }
        }

        async function LoadEmployee() {
            let responseEmployee = await EmployeeService.getEmployeeByXmlId(xmlId);

            if (responseEmployee.status === 200) {
                var processedEmployee = {
                    nombres: responseEmployee.data[0].employee.nombres,
                    apellidos: responseEmployee.data[0].employee.apellidos,
                    identification: responseEmployee.data[0].employee.identification,
                    legajo: responseEmployee.data[0].employee.legajo,
                    ips_empleado: responseEmployee.data[0].employee.ipsEmpleado,
                    mtess_patronal: responseEmployee.data[0].employee.mtessPatronal,
                    email: responseEmployee.data[0].employee.email,
                    legajo: responseEmployee.data[0].employee.legajo,
                    departamento: responseEmployee.data[0].employee.departamento,
                    sueldoJornal: responseEmployee.data[0].employee.sueldoJornal
                }
                localEmployee = processedEmployee;
                handleEmployee(processedEmployee);
                return processedEmployee;
            } else {
                message('error', responseEmployee.data)
            }
        }

        async function LoadXMLDetails() {

            let responseXMLDetails = await XmlService.getXmlDetails(xmlId);
            responseXMLDetails.data = responseXMLDetails.data.sort(function (a, b) {
                if (a.xmlDetails.sort > b.xmlDetails.sort) {
                    return 1;
                }
                if (a.xmlDetails.sort < b.xmlDetails.sort) {
                    return -1;
                }
                return 0;
            });
            console.log('XML Dets ', responseXMLDetails)

            if (responseXMLDetails.status === 200) {
                let xmlDetails = [];

                responseXMLDetails.data.sort(
                    (a, b) => new Date(a.xmlDetails.createdAt) - new Date(b.xmlDetails.createdAt)
                ).map(details => {
                    var xmlDetailsProcessed = {
                        descripcion: details.xmlDetails.descripcion,
                        codigo: details.xmlDetails.codigo,
                        aclaracionConcepto: details.aclaracionConcepto,
                        cantidad: details.xmlDetails.cant,
                        ingresos: details.xmlDetails.ingresos,
                        ingresosNo: details.xmlDetails.ingresosNo,
                        unidade: details.xmlDetails.unidade,
                        retenciones: details.xmlDetails.retenciones
                    }
                    xmlDetails.push(xmlDetailsProcessed)
                    handleXmlDetails(xmlDetails);
                });
            } else {
                message('error', responseXMLDetails.data)
            }
        }

        await LoadEmployee().then(async (employeeMTESS) => {
            console.log(employeeMTESS);
            await LoadCompany(employeeMTESS.mtess_patronal);
            await LoadXML();
            await LoadXMLDetails();
            await LoadRejections()
        });
    }

    async function handleDeactivateCancelClose() {
        setDeactivateOpen(false);
    }

    async function handleDeactivateClose() {
        setDeactivateOpen(false);
        if (motivoDesactivacion != "") {
            deactivateDocument()
        }
    }

    async function deactivateDocument() {
        const deactivateResponse = await XmlService.deactivateDocument(xmlId, motivoDesactivacion)

        await LoadXML()

        return message("success", "Documento desactivado exitosamente");
    }

    function handleNotificar() {
        let data = {
            from: userEmail,
            xmlId: xmlId
        };

        MessageService.SendReminder(data).then(response => {
            if (response.status != 200) {
                message('error', response.data.message);
            } else {
                message('success', response.data.message);
            }
        });

    }

    function message(type = "null", message = "") {
        dispatchMsg(
            Actions.showMessage({
                message: message,
                autoHideDuration: 6000, //ms
                anchorOrigin: {
                    vertical: "top", //top bottom
                    horizontal: "center" //left center right
                },
                variant: type //success error info warning null
            })
        );
    }

    function handleClickOpen() {
        setOpen(true);
    }

    async function handleCancelClose() {
        setOpen(false);
    }

    async function handleSupportCancelClose() {
        setSupportOpen(false);
        handleQueja('')
    }

    async function handleSupportClose() {
        setSupportOpen(false);
        if (queja != '') {
            QuejaService.sendSupport(
                userEmail,
                queja
            )
            message("success", "Queja/inquietud enviada con éxito");
        }
        handleQueja('')
    }

    const formatPeriodoPago = (mes_de_pago) => {
        const startDay = new Date(mes_de_pago)
        const endDay = new Date(mes_de_pago)

        startDay.setDate(1)
        endDay.setDate(1)

        endDay.setMonth(endDay.getMonth() + 1)
        endDay.setDate(0)

        return moment(startDay).local(momentESLocale).format("DD/MM/YYYY")
        + ' - '
        + moment(endDay).local(momentESLocale).format("DD/MM/YYYY")
    }
    
    async function handleClose() {
        setOpen(false);
        if (pin != "") {
            //CHAMA API PARA SALVAR
            var key = process.env.REACT_APP_KEY_PASS;
            var email = aes256.encrypt(key, userEmail.toLowerCase().trim());
            var pinc = aes256.encrypt(key, pin);
            let resultSignature = await SignatureService.sign(pinc, email, xmlId);

            if (resultSignature.status === 200) {
                //VERIFICAR STATUS
                if (resultSignature.data.status === "success") {
                    message("success", resultSignature.data.data);
                    handleNotificar()
                } else {
                    message("error", resultSignature.data.data);
                }
            } else {
                //ERRO
                message("error", resultSignature.data.data);
            }

            handlePin("");
            toggleButtonFirmar("disabled");

            await LoadXML()
        }
    }

    async function addRejectionMessage() {
        if (!rejectionMessage) return
        await XmlService.addRejection(xmlId, {
            user_email: userEmail,
            message: rejectionMessage,
        })

        LoadRejections()
        handleRejectionMessage('')
    }

    function SelectInvoice(value) {
        let viewOption = "";
        if ((Object.entries(value.employee).length > 0) && (Object.entries(value.company).length > 0) && (Object.entries(value.invoice).length > 0) && (value.detail.length > 0)) {
            switch (value.type) {
                case 'aguinaldo':
                    viewOption = <ModernInvoicePageAguinaldo employee={value.employee} company={value.company} invoice={value.invoice} detail={value.detail} xml={value.xml}></ModernInvoicePageAguinaldo>
                    break;
                case 'pago':
                case null:
                    viewOption = <ModernInvoicePagePago  employee={value.employee} company={value.company} invoice={value.invoice} detail={value.detail} xml={value.xml}></ModernInvoicePagePago>
                    break;
                case 'vacaciones':
                    viewOption = <ModernInvoicePageVacaciones employee={value.employee} company={value.company} invoice={value.invoice} detail={value.detail} xml={value.xml}></ModernInvoicePageVacaciones>
                    break;
                default:
                    viewOption = <div></div>
                    break;
            }
        } else {
            viewOption = <div></div>
        }
        return viewOption;
    }

    return (
        <div className={clsx(classes.root, "flex-grow flex-shrink-0 p-0 sm:p-64 print:p-0")}>

            {(renderIf(xml.status !== 'DES'))(
                <Paper className="p-12 mb-24 hidden-print">
                    <Tooltip title="Volver" placement="top">
                        <IconButton
                            onClick={() => { props.history.goBack() }}
                        >
                            <Icon>arrow_back</Icon>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="" placement="top">
                        <IconButton
                            onClick={() => { window.print() }}
                        >
                            <Icon>cloud_download</Icon>
                        </IconButton>
                    </Tooltip>
                    {renderIf((userProfile == 'rh' || userProfile == 'rh_not_signer') && xml.status == 'PEN')(
                        <Tooltip title="Desactivar documento" placement="top">
                            <IconButton
                                onClick={() => setDeactivateOpen(true)}
                            >
                                <Icon>block</Icon>
                            </IconButton>
                        </Tooltip>
                    )}
                </Paper>
            )}

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Para firmar el documento, debe proporcionar su PIN de certificado digital.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="pin"
                        label="PIN"
                        type="password"
                        onChange={e => handlePin(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Firmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deactivateOpen} onClose={handleDeactivateClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-deactivate-dialog-title">Desactivar documento</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Por favor, ingrese el motivo de la desactivación del documento.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="motivoDesactivacion"
                        label="Motivo"
                        value={motivoDesactivacion}
                        onChange={e => handleMotivoDesactivacion(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeactivateCancelClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDeactivateClose} color="primary">
                        Desactivar Documento
                    </Button>
                </DialogActions>
            </Dialog>

            {(renderIf(xml.motivoDesactivacion))(
                <Card className="mx-auto w-xl print:w-full print:shadow-none mb-24">

                    <CardContent className="p-88 print:p-0">

                        <div className="flex flex-row justify-between items-start">

                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <Typography variant="h5" className="font-light print:text-16" color="textSecondary">¡DOCUMENTO DESACTIVADO!</Typography>
                                </div>
                            </div>
                        </div>

                        <div className="print:mt-0">
                            <Typography variant="h6" className="font-light print:text-16" color="textSecondary">Motivo de desactivación</Typography>
                            {xml.motivoDesactivacion}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className={"mx-auto w-xl print:w-full hidden-print mb-24" + (rejections.length == 0 ? "hidden-print" : "")}>

                <CardContent className="p-88 print:p-0">

                    <div className="flex flex-row justify-between items-start">

                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <Typography variant="h5" className="font-light print:text-16" color="textSecondary">RECHAZOS</Typography>
                            </div>
                        </div>
                    </div>

                    <div className="mt-44 print:mt-0">
                        <Table className="simple">

                            {<TableHead>
                                <TableRow>
                                    <TableCell>
                                        USUARIO
                                    </TableCell>
                                    <TableCell align="right">
                                        MENSAJE
                                    </TableCell>
                                    <TableCell align="right">
                                        FECHA Y HORA
                                    </TableCell>
                                </TableRow>
                            </TableHead>}
                            <TableBody>
                                {rejections.map((rejection) => (
                                    <TableRow key={rejection.id}>
                                        <TableCell>
                                            <Typography variant="subtitle1">{rejection.name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {rejection.message}
                                        </TableCell>
                                        <TableCell align="right">
                                            {moment(rejection.created_at).local(momentESLocale).format("DD/MM/YYYY HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="hidden-print">
                                    <TableCell colSpan="2">
                                        <TextField
                                            id="standard-multiline-flexible"
                                            label="Ingrese un mensaje de rechazo"
                                            multiline
                                            rowsMax="4"
                                            //value={values.multiline}
                                            //onChange={handleChange('multiline')}
                                            margin="normal"
                                            value={rejectionMessage}
                                            onChange={e => handleRejectionMessage(e.target.value)}
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            className="w-224 mx-auto mt-16"
                                            aria-label="Agregar Mensaje"
                                            type="button"
                                            onClick={addRejectionMessage}
                                        >
                                            AGREGAR MENSAJE
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {xml && (
                <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>
                    <Card className="mx-auto w-xl print:w-full print:shadow-none">
                        <SelectInvoice type={xml.identificator} company={company} employee={employee} invoice={xml} detail={xmlDetails} xml={xml}></SelectInvoice>
                        <CardContent className="p-88 print:p-0">

                            {/* <div className="flex flex-row justify-between items-start">

                                <div className="flex flex-col">

                                    <div className="flex items-center mb-60 print:mb-0">

                                        <div className="flex justify-end items-center w-160 print:w-60">
                                        <img className="w-160 print:w-60" src={ process.env.REACT_APP_FACTURA_LOGO ? ("/" + process.env.REACT_APP_FACTURA_LOGO) : "/assets/images/logos/logo_code100.png" } alt="logo" />
                                        </div>

                                        <div className={clsx(classes.divider, "mx-48 w-px h-128 print:mx-16")} />
                                        
                                        

                                        <div className="max-w-200">

                                            {company.razon_social && (
                                                <Typography color="textSecondary">
                                                    <span>Razon Social: </span>
                                                    {company.razon_social}
                                                </Typography>
                                            )}
                                            {company.ruc && (
                                                <Typography color="textSecondary">
                                                    <span>RUC: </span>
                                                    {company.ruc}
                                                </Typography>
                                            )}
                                            {company.mtess_patronal && (
                                                <Typography color="textSecondary">
                                                    <span>Número Patronal MTESS: </span>
                                                    {employee.mtess_patronal}
                                                </Typography>
                                            )}
                                            {company.ips && (
                                                <Typography color="textSecondary">
                                                    <span>Número Patronal IPS: </span>{company.ips}
                                                </Typography>
                                            )}
                                            {company.director && (
                                                <Typography color="textSecondary">
                                                    <span>Empleador: </span>
                                                    {company.director}
                                                </Typography>
                                            )}
                                            {company.website && (
                                                <Typography color="textSecondary">
                                                    <span>Web:</span>
                                                    {company.website}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="flex justify-end items-center w-160 print:w-60">
                                            <Typography variant="h5" className="font-light print:text-16" color="textSecondary">EMPLEADO</Typography>
                                        </div>

                                        <div className={clsx(classes.divider, "mx-48 w-px h-128 print:mx-16")} />

                                        <div className="max-w-200">

                                            <Typography color="textSecondary">Nombre y Apellido del trabajador: {employee.nombres + " " + employee.apellidos}</Typography>

                                            {employee.identification && (
                                                <Typography color="textSecondary">
                                                    <span>CI: </span>
                                                    {employee.identification}
                                                </Typography>
                                            )}
                                            {employee.ips_empleado && (
                                                <Typography color="textSecondary">
                                                    <span>IPS: </span>
                                                    {employee.ips_empleado}
                                                </Typography>
                                            )}
                                            {employee.email && (
                                                <Typography color="textSecondary">
                                                    <span>Correo: </span>
                                                    {employee.email}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="pr-16 pb-32">
                                                <Typography className="font-light text-right" variant="h5" color="textSecondary">
                                                    LIQUIDACION DE SALARIO
                                                </Typography>
                                            </td>
                                            {/* <td className="pb-32">
                                                <Typography className="font-light" variant="h6">
                                                    {document.id}
                                                </Typography>
                                            </td> 
                                        </tr>

                                        <tr>
                                            <td className="text-right pr-16">
                                                <Typography color="textSecondary">
                                                    NUMERO DE RECIBO
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography>
                                                    {xml.numero_recibo}
                                                </Typography>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className="text-right pr-16">
                                                <Typography color="textSecondary">
                                                    FECHA DE PAGO
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography>
                                                    {moment(xml.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY")}
                                                </Typography>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className="text-right pr-16">
                                                <Typography color="textSecondary">
                                                    PERIODO DE PAGO
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography>
                                                    {formatPeriodoPago(xml.mes_de_pago)}
                                                </Typography>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className="text-right pr-16">
                                                <Typography color="textSecondary">
                                                    TOTAL A COBRAR
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography>
                                                    {formatter.format(xml.total_ingresos - xml.total_retenciones)}
                                                </Typography>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-44 print:mt-0">
                                <span className="articulo-ley">
                                    <b>Liquidación de salario conforme al Art. 236 del Código laboral <br /></b>
                                    </span>

                                <Table className="simple">

                                    {<TableHead>
                                        <TableRow>
                                            <TableCell>
                                                DESCRIPCION
                                            </TableCell>
                                            <TableCell align="right">
                                                CANTIDAD
                                            </TableCell>
                                            <TableCell align="right">
                                                ACLARACION
                                            </TableCell> 
                                            <TableCell align="right">
                                                INGRESOS
                                            </TableCell>
                                            <TableCell align="right">
                                                DESCUENTOS
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>}
                                    <TableBody>
                                        {xmlDetails.map((details) => (
                                            <TableRow key={details.id}>
                                                <TableCell>
                                                    <Typography variant="subtitle1">{details.descripcion}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{details.detail}</Typography> 
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="subtitle1">{details.cantidad}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{details.detail}</Typography> 
                                                </TableCell>
                                                <TableCell align="right">
                                                    {details.aclaracionConcepto}
                                                </TableCell> 
                                                <TableCell align="right">
                                                    {formatter.format(details.ingresos)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatter.format(details.retenciones)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Table className="simple">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Typography className="font-medium" variant="subtitle1" color="textSecondary">TOTAL INGRESOS</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography className="font-medium" variant="subtitle1" color="textSecondary">
                                                    {formatter.format(xml.total_ingresos)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography className="font-medium" variant="subtitle1" color="textSecondary">TOTAL DESCUENTOS</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography className="font-medium" variant="subtitle1" color="textSecondary">
                                                    {formatter.format(xml.total_retenciones)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography className="font-light" variant="h5" color="textSecondary">TOTAL NETO</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography className="font-light" variant="h5" color="textSecondary">
                                                    {formatter.format(xml.total_neto)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography className="font-light" variant="subtitle2" color="textSecondary">NETO EN LETRAS</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography className="font-light" variant="subtitle2" color="textSecondary">
                                                    {xml.neto_en_letras}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                        </div>*/}

                            <Grid container spacing={3}>
                                {(renderIf(xml.observation && xml.observation !== 'undefined'))(
                                    <Grid item xs={12} md={9}>
                                        <Typography className="mb-24 print:mb-12" variant="body1">Observaciones: {xml.observation}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12} md={12}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={4} md={4} style={{ textAlign: 'center' }}>
                                            {renderIf(firmasHolografas.rrhh)(
                                                <img style={{ height: '100px' }} src={process.env.REACT_APP_API_HOST + '/' + firmasHolografas.rrhh} />
                                            )}
                                            {renderIf(firmasView.rrhh_view)(
                                                <Typography className="mb-24 print:mb-12" variant="body1">Firma RRHH: {firmas.rrhh}</Typography>
                                            )}
                                        </Grid>
                                        <Grid item xs={4} md={4} style={{ textAlign: 'center' }}>
                                            {renderIf(firmasHolografas.director)(
                                                <img style={{ height: '100px' }} src={process.env.REACT_APP_API_HOST + '/' + firmasHolografas.director} />
                                            )}
                                            {renderIf(firmasView.director_view)(
                                                <Typography className="mb-24 print:mb-12" variant="body1">Firma Director: {firmas.director}</Typography>
                                            )}
                                        </Grid>
                                        <Grid item xs={4} md={4} style={{ textAlign: 'center' }}>
                                            {renderIf(firmasHolografas.empleado)(
                                                <img style={{ height: '100px' }} src={process.env.REACT_APP_API_HOST + '/' + firmasHolografas.empleado} />
                                            )}
                                            {renderIf(firmasView.empleado_view)(
                                                <Typography className="mb-24 print:mb-12" variant="body1">Firma Empleado: {firmas.empleado}</Typography>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                    <div className="mt-96 print:mt-0 print:px-16">
                                        Recibi conforme de la empresa, original e importe neto de la presente liquidación
                                    </div>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <div className="mt-96 print:mt-0 print:px-16">
                                        {renderIf(qrCode)(<QRCode value={`${process.env.REACT_APP_MTESS_PORTAL_URL}/kude/${hashKude}`} />)}
                                    </div>
                                </Grid>
                            </Grid>

                            {(renderIf(userProfile != 'rh_not_signer'))(
                                <Grid container spacing={3} className="hidden-print">
                                    <Grid item xs={12} md={12} style={{ 'textAlign': 'center' }}>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            color="primary"
                                            className="mx-auto mt-32"
                                            aria-label="Firmar"
                                            disabled={buttonFirmar}
                                            onClick={handleClickOpen}
                                        //disabled={!isContactsFormValid}
                                        >
                                            FIRMAR RECIBO DE SALARIO
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </FuseAnimate>
            )}
        </div>
    );
}

export default ModernInvoicePage;

/**

 Use the following elements to add breaks to your pages. This will make sure that the section in between
 these elements will be printed on a new page. The following two elements must be used before and after the
 page content that you want to show as a new page. So, you have to wrap your content with them.

 Elements:
 ---------
 <div className="page-break-after"></div>
 <div className="page-break-before"></div>


 Example:
 --------

 Initial page content!

 <div className="page-break-after"></div>
 <div className="page-break-before"></div>

 This is the second page!

 <div className="page-break-after"></div>
 <div className="page-break-before"></div>

 This is the third page!

 <div className="page-break-after"></div>
 <div className="page-break-before"></div>
 **/
