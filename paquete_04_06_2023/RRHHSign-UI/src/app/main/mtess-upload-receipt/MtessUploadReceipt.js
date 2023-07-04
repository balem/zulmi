import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon } from '@material-ui/core';
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

const useStyles = makeStyles(theme => ({
    root: {
        background: 'radial-gradient(' + darken(theme.palette.primary.dark, 0.5) + ' 0%, ' + theme.palette.primary.dark + ' 80%)'
    },
    divider: {
        backgroundColor: theme.palette.divider
    }
}));


function MtessUploadReceipt(props) {
    const classes = useStyles();
    const dispatchMsg = useDispatch();

    const [open, setOpen] = useState(false);
    const [pin, handlePin] = useState('');
    const [xmlId, handleXmlId] = useState(props.match.params.id);
    const [xml, handleXml] = useState([]);
    const [xmlDetails, handleXmlDetails] = useState([]);
    const [firmas, handleFirmas] = useState([]);

    const [company, handleCompany] = useState({});
    const [employee, handleEmployee] = useState({});

    const [buttonFirmar, toggleButtonFirmar] = useState("disabled");

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let userProfile = user.role[0];

    //console.log(user);

    const formatter = new Intl.NumberFormat('es-PY',
        {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        });

    useEffect(() => {
        async function LoadCompany() {
            let responseCompany = await CompanyService.getCompany();
            let responseDirector = await EmployeeService.getDirector();

            if (responseCompany.status === 200) {
                var processedCompany = {
                    ruc: responseCompany.data[0].company.ruc,
                    ips: responseCompany.data[0].company.ipsPatronal,
                    director: responseDirector.name,
                    website: ""
                }
                handleCompany(processedCompany);
            } else {
                message('error', 'Registro de la empresa no encontrado')
            }
        }

        async function LoadEmployee() {
            let responseEmployee = await EmployeeService.getEmployeeByXmlId(xmlId);
            if (responseEmployee.status === 200) {
                var processedEmployee = {
                    nombres: responseEmployee.data.data.nombres,
                    apellidos: responseEmployee.data.data.apellidos,
                    identification: responseEmployee.data.data.identification,
                    ips_empleado: responseEmployee.data.data.ipsEmpleado,
                    email: responseEmployee.data.data.email
                }
                handleEmployee(processedEmployee);
            } else {
                message('error', responseEmployee.data)
            }
        }

        async function LoadXML() {
            let responseXML = await XmlService.getXmlById(xmlId);

            if (responseXML.status === 200) {
                var processedXML = {
                    fecha_de_pago: responseXML.data[0].xml.fechaDePago,
                    mes_de_pago: responseXML.data[0].xml.mesDePago,
                    total_ingresos: responseXML.data[0].xml.totalIngresos,
                    total_retenciones: responseXML.data[0].xml.totalRetenciones,
                    total_neto: responseXML.data[0].xml.totalNeto,
                    neto_en_letras: responseXML.data[0].xml.netoEnLetras
                }

                const firmas = {
                    rrhh: responseXML.data[0].xml.signatureRRHH === true ? "Firmado: " + moment(responseXML.data[0].xml.signatureRRHHDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].xml.signatureRRHHName : "No Firmado",
                    director: responseXML.data[0].xml.signatureDirector === true ? "Firmado: " + moment(responseXML.data[0].xml.signatureDirectorDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].xml.signatureDirectorName : "No Firmado",
                    empleado: responseXML.data[0].xml.signatureEmployee === true ? "Firmado: " + moment(responseXML.data[0].xml.signatureEmployeeDatetime).format('DD/MM/YYYY HH:mm:ss') + " por " + responseXML.data[0].xml.signatureEmployeeName : "No Firmado",
                }

                //HABILITA OU DESABILITA O BOTÃO DE FIRMAR
                if (responseXML.data[0].xml.signatureRRHH === true && user.role[0] === "rh") {
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

                handleXml(processedXML);
                handleFirmas(firmas);
            } else {
                message('error', responseXML.data)
            }
        }

        async function LoadXMLDetails() {

            let responseXMLDetails = await XmlService.getXmlDetails(xmlId);


            if (responseXMLDetails.status === 200) {
                let xmlDetails = [];

                responseXMLDetails.data.map(details => {
                    var xmlDetailsProcessed = {
                        descripcion: details.xmlDetails.descripcion,
                        codigo: details.xmlDetails.codigo,
                        cantidad: details.xmlDetails.cant,
                        ingresos: details.xmlDetails.ingresos,
                        retenciones: details.xmlDetails.retenciones
                    }

                    xmlDetails.push(xmlDetailsProcessed)

                    handleXmlDetails(xmlDetails);
                });
            } else {
                message('error', responseXMLDetails.data)
            }
        }

        LoadCompany();
        LoadEmployee();
        LoadXML();
        LoadXMLDetails();
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
        setOpen(false);
        if (pin != "") {
            //CHAMA API PARA SALVAR
            var key = process.env.REACT_APP_KEY_PASS;
            var email = aes256.encrypt(key, email.toLowerCase().trim());
            var pinc = aes256.encrypt(key, pin);
            let resultSignature = await SignatureService.sign(pinc, email, userProfile, xmlId);

            if (resultSignature.status === 200) {
                //VERIFICAR STATUS
                if (resultSignature.data.status === "success") {
                    message("success", resultSignature.data.data);
                } else {
                    message("error", resultSignature.data.data);
                }
            } else {
                //ERRO
                message("error", resultSignature.data.data);
            }

            handlePin("");
            toggleButtonFirmar("disabled");
        }
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
                <Tooltip title="Firmar" placement="top">
                    <IconButton
                        disabled={buttonFirmar}
                        onClick={handleClickOpen}
                    >
                        <Icon>assignment_turned_in</Icon>
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

            {xml && (

                <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>

                    <Card className="mx-auto w-xl print:w-full print:shadow-none">

                        <CardContent className="p-88 print:p-0">

                            <div className="flex flex-row justify-between items-start">

                                <div className="flex flex-col">

                                    <div className="flex items-center mb-60 print:mb-0">

                                        <img className="w-160 print:w-60" src="assets/images/logos/main_logo.png" alt="logo" />

                                        <div className={clsx(classes.divider, "mx-48 w-px h-128 print:mx-16")} />

                                        <div className="max-w-200">

                                            <Typography color="textSecondary">Liquidación de Salario</Typography>

                                            {company.ruc && (
                                                <Typography color="textSecondary">
                                                    <span>RUC: </span>
                                                    {company.ruc}
                                                </Typography>
                                            )}
                                            {company.ips && (
                                                <Typography color="textSecondary">
                                                    <span>IPS: </span>
                                                    {company.ips}
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

                                            <Typography color="textSecondary">{employee.nombres + " " + employee.apellidos}</Typography>

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
                                                    RECIBO DE HABERES
                                                </Typography>
                                            </td>
                                            {/* <td className="pb-32">
                                                <Typography className="font-light" variant="h6">
                                                    {document.id}
                                                </Typography>
                                            </td> */}
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
                                                    MES DE PAGO
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography>
                                                    {moment(xml.mes_de_pago).local(momentESLocale).format("MMM YYYY")}
                                                </Typography>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className="text-right pr-16">
                                                <Typography color="textSecondary">
                                                    TOTAL DEVIDO
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

                                <Table className="simple">
                                    {<TableHead>
                                        <TableRow>
                                            <TableCell>
                                                DESCRIPCION
                                            </TableCell>
                                            <TableCell align="right">
                                                CODIGO
                                            </TableCell>
                                            <TableCell align="right">
                                                CANTIDAD
                                            </TableCell>
                                            <TableCell align="right">
                                                INGRESOS
                                            </TableCell>
                                            <TableCell align="right">
                                                RETENCIONES
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>}
                                    <TableBody>
                                        {xmlDetails.map((details) => (
                                            <TableRow key={details.id}>
                                                <TableCell>
                                                    <Typography variant="subtitle1">{details.descripcion}</Typography>
                                                    {/* <Typography variant="caption" color="textSecondary">{details.detail}</Typography> */}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {details.codigo}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="subtitle1">{details.cantidad}</Typography>
                                                    {/* <Typography variant="caption" color="textSecondary">{details.detail}</Typography> */}
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
                                                <Typography className="font-medium" variant="subtitle1" color="textSecondary">TOTAL RETENCIONES</Typography>
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

                            </div>

                            <div className="mt-96 print:mt-0 print:px-16">
                                <Typography className="mb-24 print:mb-12" variant="body1">Firma RRHH: {firmas.rrhh}</Typography>
                                <Typography className="mb-24 print:mb-12" variant="body1">Firma Director: {firmas.director}</Typography>
                                <Typography className="mb-24 print:mb-12" variant="body1">Firma Empleado: {firmas.empleado}</Typography>
                            </div>
                        </CardContent>
                    </Card>
                </FuseAnimate>
            )}
        </div>
    );
}

export default MtessUploadReceipt;

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
