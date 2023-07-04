import React, { useEffect, useState } from 'react';
import { Fab, Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon, Grid } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { makeStyles } from '@material-ui/styles';
import aes256 from 'aes256';
import { useSelector } from 'react-redux';
import EmployeeService from './../../services/EmployeeService/index';
import CompanyService from './../../services/CompanyService/index';
import SignatureService from './../../services/SignatureService/index';
import XmlService from './../../services/XmlService/index';
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
import ComprobanteService from 'app/services/ComprobanteService';

const useStyles = makeStyles(theme => ({
    root: {
        background: 'radial-gradient(' + darken(theme.palette.primary.dark, 0.5) + ' 0%, ' + theme.palette.primary.dark + ' 80%)'
    },
    divider: {
        backgroundColor: theme.palette.divider
    }
}));


function ComprobantePage(props) {
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
    const [company, handleCompany] = useState({});
    const [employee, handleEmployee] = useState({});
    const [buttonFirmar, toggleButtonFirmar] = useState("disabled");

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    const email = user.data.email;
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

    async function LoadXML() {
        let responseXML = await ComprobanteService.getComprobanteById(xmlId);

        if (responseXML.status === 200) {
            setHashKude(responseXML.data[0].comprobante.hashKude);

            var processedXML = {
                total_ingresos: responseXML.data[0].comprobante.totalIngresos,
                total_retenciones: responseXML.data[0].comprobante.totalRetenciones,
                total_neto: responseXML.data[0].comprobante.totalNeto,
                neto_en_letras: responseXML.data[0].comprobante.netoEnLetras,
                status: responseXML.data[0].comprobante.status,
                observation: responseXML.data[0].comprobante.observation,
                periodo: responseXML.data[0].comprobante.periodo,
                fecha_de_pago: responseXML.data[0].comprobante.fechaDePago,
            }

            const firmas = {
                rrhh: responseXML.data[0].comprobante.signatureRRHH === true ? "Firmado: " + moment(responseXML.data[0].comprobante.signatureRRHHDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].comprobante.signatureRRHHName : "No Firmado",
                director: responseXML.data[0].comprobante.signatureDirector === true ? "Firmado: " + moment(responseXML.data[0].comprobante.signatureDirectorDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].comprobante.signatureDirectorName : "No Firmado",
                empleado: responseXML.data[0].comprobante.signatureEmployee === true ? "Firmado: " + moment(responseXML.data[0].comprobante.signatureEmployeeDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].comprobante.signatureEmployeeName : "No Firmado",
            }

            const firmasHolografas = {
                rrhh: responseXML.data[0].comprobante.signatureRRHHHolograph,
                director: responseXML.data[0].comprobante.signatureDirectorHolograph,
                empleado: responseXML.data[0].comprobante.signatureEmployeeHolograph,
            }

            if (user.role[0] === "director") {
                //
            }

            //HABILITA OU DESABILITA O BOTÃO DE FIRMAR
            if (user.role[0] === "director" && responseXML.data[0].comprobante.signatureRRHH !== true) {
                toggleButtonFirmar("disabled");
            } else if (user.role[0] === "funcionario" && responseXML.data[0].comprobante.signatureRRHH !== true && responseXML.data[0].comprobante.signatureDirector !== true) {
                toggleButtonFirmar("disabled");
            } else if (responseXML.data[0].comprobante.signatureRRHH === true && user.role[0] === "rh") {
                toggleButtonFirmar("disabled");
            } else if (responseXML.data[0].comprobante.signatureDirector === true && user.role[0] === "director") {
                toggleButtonFirmar("disabled");
            } else if (responseXML.data[0].comprobante.signatureEmployee === true && user.role[0] === "funcionario") {
                toggleButtonFirmar("disabled");
            } else if (user.role[0] !== "rh" && user.role[0] !== "director" && user.role[0] !== "funcionario") {
                toggleButtonFirmar("disabled");
            } else {
                toggleButtonFirmar("");
            }

            //HABILITA OU DESABILITA O QRCODE
            if (responseXML.data[0].comprobante.signatureDirector === true && responseXML.data[0].comprobante.signatureEmployee === true) {
                handleQRCode(true);
            }

            handleXml(processedXML);
            handleFirmas(firmas);
            handleFirmasHolografas(firmasHolografas);
        } else {
            message('error', responseXML.data)
        }
    }

    useEffect(() => {
        async function LoadCompany() {
            let responseCompany = await CompanyService.getCompany();
            let responseDirector = await EmployeeService.getDirector();
        }

        async function LoadEmployee() {
            let responseEmployee = await EmployeeService.getEmployeeByComprobanteId(xmlId);

            if (responseEmployee.status === 200) {
                var processedEmployee = {
                    nombres: responseEmployee.data[0].employee.nombres,
                    apellidos: responseEmployee.data[0].employee.apellidos,
                    identification: responseEmployee.data[0].employee.identification,
                    ips_empleado: responseEmployee.data[0].employee.ipsEmpleado,
                    mtess_patronal: responseEmployee.data[0].employee.mtessPatronal,
                    email: responseEmployee.data[0].employee.email,
                    legajo: responseEmployee.data[0].employee.legajo,
                    departamento: responseEmployee.data[0].employee.departamento
                }
                handleEmployee(processedEmployee);
            } else {
                message('error', responseEmployee.data)
            }
        }

        async function LoadXMLDetails() {

            let responseXMLDetails = await ComprobanteService.getComprobanteDetails(xmlId);

            if (responseXMLDetails.status === 200) {
                let xmlDetails = [];

                responseXMLDetails.data.sort(
                    (a, b) => new Date(a.comprobanteDetails.createdAt) - new Date(b.comprobanteDetails.createdAt)
                ).map(details => {
                    var xmlDetailsProcessed = {
                        concepto: details.comprobanteDetails.concepto,
                        unidade: details.comprobanteDetails.unidade,
                        ingresos: details.comprobanteDetails.ingresos,
                        retenciones: details.comprobanteDetails.retenciones
                    }

                    xmlDetails.push(xmlDetailsProcessed)
                });
                handleXmlDetails(xmlDetails);
            } else {
                message('error', responseXMLDetails.data)
            }
        }

        LoadCompany();
        LoadEmployee();
        LoadXML();
        LoadXMLDetails();
    }, []);

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
            from : userEmail,
            profile: userProfile,
            xmlId : xmlId
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

    async function handleClose() {
        setOpen(false);
        if (pin != "") {
            //CHAMA API PARA SALVAR
            var key = process.env.REACT_APP_KEY_PASS;
            if ((!email) || (email == undefined)) {
                var email = userEmail;
            } else {
                var email = '';
            }
            email = aes256.encrypt(key, email.toLowerCase().trim());
            var pinc = aes256.encrypt(key, pin);
            let resultSignature = await SignatureService.sign(pinc, email, userProfile, xmlId, 'comprobantes-pago');

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

        handleRejectionMessage('')
    }

    const formatPeriodoPago = (mes_de_pago) => {
        const startDay = new Date(mes_de_pago)
        const endDay = new Date(mes_de_pago)

        startDay.setDate(1)

        endDay.setMonth(endDay.getMonth() + 1)
        endDay.setDate(0)

        return moment(startDay).local(momentESLocale).format("DD/MM/YYYY")
        + ' - '
        + moment(endDay).local(momentESLocale).format("DD/MM/YYYY")
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
                    <Tooltip placement="top">
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
            
            <Dialog open={supportOpen} onClose={handleSupportClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-deactivate-dialog-title">Enviar Queja o Inquietud</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Por favor, ingrese su queja
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="queja"
                        label="Queja o inquietud"
                        value={queja}
                        onChange={e => handleQueja(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSupportCancelClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSupportClose} color="primary">
                        Enviar Queja/Inquietud
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
                        { xml.motivoDesactivacion }
                    </div>
                </CardContent>
            </Card>
            )}

            {/* <Card id='rechazo' className={"mx-auto w-xl print:w-full print:shadow-none mb-24" + (rejections.length == 0 ? "hidden-print" : "")}>

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
            </Card> */}

            {xml && (

                <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>

                    <Card className="mx-auto w-xl print:w-full print:shadow-none" >

                        <CardContent className="p-88 print:p-0" style={{display: "block", height: "1011px"}}>
                            <div className="flex justify-end items-center w-800 print:w-600">
                            <img className="w-600 print:w-400" src={"/assets/images/logos/main_logo.png" } alt="logo" />
                            <Typography className="font-light text-right" variant="h5" color="textSecondary">
                                    COMPROBANTE DE PAGO
                                </Typography>
                            </div>
                            
                            <div className="flex flex-row justify-between items-start">
                                
                                <div className="flex flex-col" style={{ display: "inline-block", width: "100%", height: "146px"}}>

                                    <div style={{position: "relative", float: "left", width: "49%"}}>

                                       {/*  <div className={clsx(classes.divider, "mx-48 w-px h-128 print:mx-16")} /> */}
 
                                        <div >

                                            <Typography color="textSecondary">
                                                <span>Razón Social: </span>
                                                Paraguay Refrescos S.A. {/* {company.razon_social} */}
                                            </Typography>

                                            <Typography color="textSecondary">
                                                    <span>RUC: </span>
                                                    80003400-7{/* {company.ruc} */}
                                                </Typography>
                                           
                                            
                                            <Typography color="textSecondary">
                                                    <span>Dirección: </span>
                                                    Ruta Acceso Sur km 3,5, Barcequillo
                                                </Typography>


                                           
                                                <Typography color="textSecondary">
                                                    <span>Número Patronal MTESS: </span>
                                                    {employee.mtess_patronal}
                                                </Typography>
                                           
                                           
                                                <Typography color="textSecondary">
                                                    <span>Número Patronal IPS: </span> { ipsFormatter(employee.ips_empleado) } { /* company.ips */}
                                                </Typography>
                                         
                                           
                                        </div>
                                    </div>

                                    <div style={{position: "relative", float: "left",  width: "49%"}}>
                                        <div >
                                            
                                            <Typography color="textSecondary">
                                                Legajo:  { employee.legajo }
                                            </Typography>

                                            <Typography color="textSecondary">
                                                Nombres y apellidos:  {  employee.nombres + " " + employee.apellidos }
                                            </Typography>

                                            {employee.identification && (
                                                <Typography color="textSecondary">
                                                    <span>CI: </span>
                                                    {employee.identification}
                                                </Typography>
                                            )}
                                           
                                            {employee.email && (
                                                <Typography color="textSecondary">
                                                    <span>Correo: </span>
                                                    {employee.email}
                                                </Typography>
                                            )}

                                            <Typography color="textSecondary">
                                            <span>Departamento: </span>{ employee.departamento }
                                            </Typography>

                                            <Typography color="textSecondary">
                                                    <span>Periodo de </span> { xml.periodo } {/* { moment(xml.mes_de_pago).local(momentESLocale).format("MM/YYYY")}  */}
                                                    
                                            </Typography>

                                            {(renderIf(xml.fecha_de_pago != null && moment(xml.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY") != '01/01/0001') (
                                                <Typography color="textSecondary">
                                                    <span>Fecha de acreditación de pago: </span> { moment(xml.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY") } {/* { moment(xml.mes_de_pago).local(momentESLocale).format("MM/YYYY")}  */}                                                    
                                                </Typography>
                                            ))}

                                        </div>
                                    </div>
                                </div>
                            </div> 

                            <div >
                              
                                <Table style={{ width:"100%"}}>

                                    {<TableHead>
                                        <TableRow>
                                            <TableCell align="center" style={{border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0",height:'14px', fontSize:"10px"}}>
                                                CONCEPTOS
                                            </TableCell>
                                            <TableCell align="center" style={{border: "solid 1px black", padding: "0",backgroundColor: "#c0c0c0", height:'14px',fontSize:"10px"}}>
                                                UNIDADES
                                            </TableCell>
                                            <TableCell align="center" style={{border: "solid 1px black", padding: "0",backgroundColor: "#c0c0c0",height:'14px', fontSize:"10px", width: '150px'}}>
                                                IMPORTE A ABONAR
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>}
                                    <TableBody>
                                        { xmlDetails.map((details) => (
                                            <TableRow key={details.id}>
                                                <TableCell style={{border: "solid 1px black", padding: "0", height:'18px',fontSize:"10px"}}>
                                                   {details.concepto}
                                                    
                                                </TableCell>
                                                <TableCell align="right" style={{border: "solid 1px black",  padding: "0",height:'18px',fontSize:"10px"}}>
                                                  {decimalFormatterFormat(details.unidade)}
                                                   
                                                </TableCell>
                                                <TableCell align="right" style={{border: "solid 1px black", padding: "0",height:'18px',fontSize:"10px"}}>
                                                    {decimalFormatterFormat(details.ingresos)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                       </TableBody>
                                        {<TableBody>
                                            <TableRow>
                                                <TableCell colSpan="2" style={{border: "solid 1px black",  padding: "0", backgroundColor: "#c0c0c0",height:'18px',fontSize:"10px"}}>
                                                    TOTAL A ABONAR
                                                </TableCell>
                                                <TableCell  align="right" style={{border: "solid 1px black",  padding: "0" ,backgroundColor: "#c0c0c0",height:'18px',fontSize:"10px"}}>
                                                    {formatter.format(xml.total_ingresos)}       
                                                </TableCell>
                                            </TableRow>

                                            <TableRow>

                                                <TableCell align="right" colSpan="6">
                                                    <Typography className="font-light" variant="subtitle2" color="textSecondary">
                                                        SON GUARANIES: {
                                                            numeroALetras(xml.total_ingresos)
                                                            .replace('MILLONES DE', 'MILLONES')
                                                            .replace('MILLON DE', 'MILLON')
                                                        }
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>}
                                       
                                    </Table>
                                </div>

                            <Grid container spacing={3}>
                                {(renderIf(xml.observation && xml.observation !== 'undefined'))(
                                    <Grid item xs={12} md={9}>
                                        <Typography className="mb-24 print:mb-12" variant="body1">Observaciones: {xml.observation}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12} md={12}>
                                    <Grid container spacing={2}>
                                    <Grid item xs={6} md={6} style={{ textAlign: 'center' }}>
                                            {renderIf(firmasHolografas.director)(
                                                <img style={{ height: '100px' }} src={process.env.REACT_APP_API_HOST + '/' + firmasHolografas.director} />
                                            )}
                                            <Typography className="mb-24 print:mb-12" variant="body1">Firma Director: {firmas.director}</Typography>
                                        </Grid>
                                        
                                        <Grid item xs={6} md={6} style={{ textAlign: 'center' }}>
                                            {renderIf(firmasHolografas.empleado)(
                                                <img style={{ height: '100px' }} src={process.env.REACT_APP_API_HOST + '/' + firmasHolografas.empleado} />
                                            )}
                                            <Typography className="mb-24 print:mb-12" variant="body1">Firma Empleado: {firmas.empleado}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                
                                
                            </Grid>

                            {(renderIf(userProfile != 'rh_not_signer' && userProfile != 'rh'))(
                                <Grid container spacing={3} className="hidden-print">
                                    <Grid item xs={12} md={12} style={{ 'text-align': 'center' }}>
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
                                            FIRMAR COMPROBANTE DE PAGO
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </FuseAnimate>
            )}
            <Fab
                className={`fabSupportStyle fabStyleEnabled`}
                onClick={ev => {
                    ev.stopPropagation();
                    setSupportOpen(true)
                }}
            >
                <Icon>
                    help
                </Icon>
            </Fab>
        </div>
    );
}

export default ComprobantePage;