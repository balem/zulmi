import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon, Grid } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import "./KudeNotificacion.css";
import clsx from 'clsx';
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
import moment from 'moment';
import momentESLocale from "moment/locale/es";
//import { Document, Page } from 'react-pdf'
import PDFViewer from 'pdf-viewer-reactjs'
import renderIf from "../Utils/renderIf";
import MessageService from 'app/services/MessageService';
import QRCode from 'qrcode.react';
import NotificacionesService from 'app/services/NotificacionesService';

const useStyles = makeStyles(theme => ({
    root: {
        background: 'radial-gradient(' + darken(theme.palette.primary.dark, 0.5) + ' 0%, ' + theme.palette.primary.dark + ' 80%)'
    },
    divider: {
        backgroundColor: theme.palette.divider
    }
}));


function KudeNotificacion(props) {
    const classes = useStyles();
    const dispatchMsg = useDispatch();

    const [open, setOpen] = useState(false);
    const [pin, handlePin] = useState('');
    const [xmlId, handleXmlId] = useState(props.match.params.id);
    const [xml, handleXml] = useState({fecha: '',titulo: '',texto: '',nombres: '',apellidos: '',identification: '',ips_empleado: '',email: '',pdf: ''});
    const [firmas, handleFirmas] = useState([]);
    const [firmasHolografas, handleFirmasHolografas] = useState([]);
    const [qrCode, handleQRCode] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [company, handleCompany] = useState([]);

    const [buttonFirmar, toggleButtonFirmar] = useState("disabled");

    const [xPos, setXPos] = useState("0px");
    const [yPos, setYPos] = useState("0px");
    const [showMenu, setShowMenu] = useState(false);

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let userProfile = user.role[0];

    // console.log(user);

    const handleContextMenu = useCallback(
        (e) => {
            e.preventDefault();
            setXPos(`${e.pageX}px`);
            setYPos(`${e.pageY}px`);
            setShowMenu(true);
        },
        [setXPos, setYPos]
    );

    const handleClick = useCallback(() => {
        showMenu && setShowMenu(false);
    }, [showMenu]);

    const formatter = new Intl.NumberFormat('es-PY',
        {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }
    );

    async function LoadXML() {
        let responseXML = await NotificacionesService.getNotificacionById(xmlId);

        if (responseXML.status === 200) {

            var processedXML = {
                fecha: responseXML.data.data.fecha,
                titulo: responseXML.data.data.titulo,
                texto: responseXML.data.data.texto,
                nombres: responseXML.data.data.nombres,
                apellidos: responseXML.data.data.apellidos,
                identification: responseXML.data.data.identification,
                ips_empleado: responseXML.data.data.ips_empleado,
                email: responseXML.data.data.email,
                pdf: responseXML.data.pdf
            }

            if (responseXML.data.data.signature_employee_datetime) {
                var fecha = moment(responseXML.data.data.signature_employee_datetime.split("T")[0]).format('DD/MM/YYYY');
                var hora = responseXML.data.data.signature_employee_datetime.split("T")[1].split(".")[0];
            }else{
                var fecha = "";
                var hora = "";
            }   

            
            const firmas = {    
                empleado: responseXML.data.data.signature_employee === true ? "Firmado: " + fecha +" "+hora + " por " + responseXML.data.data.signature_employee_name : "No Firmado",
            }

            const firmasHolografas = {
                empleado: responseXML.data.data.signature_employee_holograph,
            }

            //HABILITA OU DESABILITA O BOTÃO DE FIRMAR
            if (user.role[0] === "rh") {
                toggleButtonFirmar("disabled");
            } else if (user.role[0] === "director") {
                toggleButtonFirmar("disabled");
            } else if (responseXML.data.data.signature_employee === true && user.role[0] === "funcionario") {
                toggleButtonFirmar("disabled");
            } else if (user.role[0] !== "rh" && user.role[0] !== "director" && user.role[0] !== "funcionario") {
                toggleButtonFirmar("disabled");
            } else {
                toggleButtonFirmar("");
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
            if (responseCompany.status === 200) {
                var processedCompany = {
                    razon_social: responseCompany.data.data[0].razon_social,
                    ruc: responseCompany.data.data[0].ruc,
                    ips: responseCompany.data.data[0].ips_patronal,
                    mtess_patronal: responseCompany.data.data[0].ips_patronal,
                    director: responseDirector.name,
                    website: "" //responseCompany.data.website
                }
                handleCompany(processedCompany);
            } else {
                message('error', 'Registro de la empresa no encontrado')
            }
        }

        LoadCompany();
        LoadXML();

        document.addEventListener("click", handleClick);
        document.addEventListener("contextmenu", handleContextMenu);
        return () => {
            document.addEventListener("click", handleClick);
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

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

    async function handleClose() {
        var pin_certificado = document.getElementById('pin').value;
        setOpen(false);
        if (pin_certificado != "") {
            //CHAMA API PARA SALVAR
            if (!email) {
                email = userEmail;
            }
            var key = process.env.REACT_APP_KEY_PASS;
            var email = aes256.encrypt(key, email.toLowerCase().trim());
            var pinc = aes256.encrypt(key, pin_certificado);
            let resultSignature = null;
            if (xml.pdf) {
                resultSignature = await SignatureService.signPdf(xmlId, pinc);
            } else {
                resultSignature = await SignatureService.sign(pinc, email, userProfile, xmlId, 'notificaciones');
            }
            console.log("respuesta de firma")
            console.log(resultSignature)
            if (resultSignature.status === 200) {
                //VERIFICAR STATUS
                if (resultSignature.data.status === "success") {
                    message("success", "Documento firmando con éxito");
                } else {
                    message("error", "No se pudo firmar el documento");
                }
                LoadXML();
            } else {
                //ERRO
                message("error", "No se pudo firmar el documento");
            }

            handlePin("");
            toggleButtonFirmar("disabled");
        }
    }

    function ViewPDF(value) {
        if ((value.value != undefined) && (value.value != '') && (value.value != null)) {
            return (
                <Grid>
                    {/* <Document
                        file={`data:application/pdf;base64,${value.value}`}
                        onLoadSuccess={onDocumentLoadSuccess} >
                        <Page pageNumber={pageNumber} />
                    </Document> */}
                    <PDFViewer
                        document={{
                            base64: value.value
                        }}
                    />
                </Grid>
            )
        } else {
            return (<Grid></Grid>)
        }
    }

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className={clsx(classes.root, "flex-grow flex-shrink-0 p-0 sm:p-64 print:p-0")}>
            <Paper className="p-12 mb-24">
                <Tooltip title="Volver" placement="top">
                    <IconButton
                        onClick={() => { props.history.goBack() }}
                    >
                        <Icon>arrow_back</Icon>
                    </IconButton>
                </Tooltip>
            </Paper>
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
                        //onChange={e => handlePin(e.target.value)}
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

            {xml && (

                <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>
                    <Card className="mx-auto w-xl print:w-full print:shadow-none">
                        <CardContent className="p-88 print:p-0">
                        <div className="flex flex-row justify-between items-start">
                            <div className="flex flex-col"></div>
                                <div className="flex items-center mb-60 print:mb-0">
                                    <div className="flex justify-end items-center w-160 print:w-60">
                                    <img className="w-160 print:w-60" src={ process.env.REACT_APP_FACTURA_LOGO ? process.env.REACT_APP_FACTURA_LOGO : "assets/images/logos/main_logo.png" } alt="logo" />
                                </div>
                            </div>
                            </div>
                            <div className="mt-44 print:mt-0">
                                <Table className="simple">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="subtitle1">Fecha</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {moment(xml.fecha.split("T")[0]).local(momentESLocale).format("DD/MM/YYYY")}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="subtitle1">Título</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {xml.titulo}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="subtitle1">Texto Notificación</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {xml.texto}
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </div>
                            <Grid>
                                <ViewPDF value={xml.pdf}></ViewPDF>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={12}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={12} style={{ textAlign: 'center' }}>
                                            {renderIf(firmasHolografas.empleado)(
                                                <img style={{ height: '100px' }} src={process.env.REACT_APP_API_HOST + '/' + firmasHolografas.empleado} />
                                            )}
                                            <Typography className="mb-24 print:mb-12" variant="body1">Firma Empleado:</Typography>
                                            <Typography className="mb-24 print:mb-12" variant="body1">{firmas.empleado}</Typography>

                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                    <div className="mt-96 print:mt-0 print:px-16">
                                        Recibí conforme esta notificación
                                    </div>
                                </Grid>
                                {/* <Grid item xs={12} md={3}>
                                    <div className="mt-96 print:mt-0 print:px-16">
                                        {(<QRCode value={`${process.env.REACT_APP_MTESS_PORTAL_URL}/kudenotificacion/${hashKude}`} />)}
                                    </div>
                                </Grid> */}
                            </Grid>
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
                                        FIRMAR NOTIFICACION
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </FuseAnimate>
            )}
        </div>
    );
}

export default KudeNotificacion;

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
