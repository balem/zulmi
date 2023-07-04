import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon, Grid } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { makeStyles } from '@material-ui/styles';

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

import QRCode from 'qrcode.react';

const useStyles = makeStyles(theme => ({
    root: {
        background: 'radial-gradient(' + darken(theme.palette.primary.dark, 0.5) + ' 0%, ' + theme.palette.primary.dark + ' 80%)'
    },
    divider: {
        backgroundColor: theme.palette.divider
    }
}));


function KudeAmonestacion(props) {
    const classes = useStyles();
    const dispatchMsg = useDispatch();

    const [open, setOpen] = useState(false);
    const [pin, handlePin] = useState('');
    const [xmlId, handleXmlId] = useState(props.match.params.id);
    const [xml, handleXml] = useState({
        sanciones: '',
        fecha_amonestacion: '10/06/2020',
        motivo_amonestacion: 'AAAAA'
});
    const [xmlDetails, handleXmlDetails] = useState([{
        id: "1",
        fecha_amonestacion: "05/05/2020",
        descripcion: "Chegou atrasado"
    }]);
    const [firmas, handleFirmas] = useState([
        {
            director: 'Firmado por Director en 05/05/2020 09:01:25',
            rrhh: "Firmado por RRHH en 05/05/2020 12:50:54",
            empleado: "Firmado por Empleado en 05/05/2020 19:20:13"
        }
    ]);
    const [hashKude, setHashKude] = useState("");
    const [qrCode, handleQRCode] = useState(false);

    const [company, handleCompany] = useState({
        razon_social: 'Austin Martin C.o',
        ruc: "65432198",
        mtessPatronal: '12344',
        ips_patronal: '987654',       
        director: "Director Uno",
        website: "www.empresa.com.py"
    });
    const [employee, handleEmployee] = useState({
        nombre: 'Cacildinha',
        identification: '45646545',
        ips_empleado: '46465463',
        email: 'magrelo@gmail.com',
        celular: '(51)915151515',
        sexo: 'feminino'
    });

    const [buttonFirmar, toggleButtonFirmar] = useState("disabled");

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let userProfile = user.role[0];

    // console.log(user);

    const formatter = new Intl.NumberFormat('es-PY',
        {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }
    );

    /*useEffect(() => {
        async function LoadCompany() {
            let responseCompany = await CompanyService.getCompany();
            let responseDirector = await EmployeeService.getDirector();

            if (responseCompany.status === 200) {
                var processedCompany = {
                    ruc: responseCompany.data[0].company.ruc,
                    ips: responseCompany.data[0].company.ipsPatronal,
                    director: responseDirector.name,
                    website: "" //responseCompany.data.website
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
                    nombres: responseEmployee.data[0].employee.nombres,
                    apellidos: responseEmployee.data[0].employee.apellidos,
                    identification: responseEmployee.data[0].employee.identification,
                    ips_empleado: responseEmployee.data[0].employee.ipsEmpleado,
                    email: responseEmployee.data[0].employee.email
                }
                handleEmployee(processedEmployee);
            } else {
                message('error', responseEmployee.data)
            }
        }

        async function LoadXML() {
            let responseXML = await XmlService.getXmlById(xmlId);

            if (responseXML.status === 200) {
                setHashKude(responseXML.data[0].xml.hashKude);

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
                } else if (responseXML.data[0].xml.signatureDirector === true && user.role[0] === "diretor") {
                    toggleButtonFirmar("disabled");
                } else if (responseXML.data[0].xml.signatureEmployee === true && user.role[0] === "funcionario") {
                    toggleButtonFirmar("disabled");
                } else if (user.role[0] !== "rh" && user.role[0] !== "diretor" && user.role[0] !== "funcionario") {
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
    }, []);*/

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
        /*if (pin != "") {
            //CHAMA API PARA SALVAR
            let resultSignature = await SignatureService.sign(pin, userEmail, xmlId);

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
        }*/
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
                {(renderIf(userProfile != 'rh_not_signer'))(
                    <Tooltip title="Firmar" placement="top">
                        <IconButton
                            disabled={buttonFirmar}
                            onClick={handleClickOpen}
                        >
                            <Icon>assignment_turned_in</Icon>
                        </IconButton>
                    </Tooltip>
                )}
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

                                        <div className="max-w-220">

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
                                            {company.mtessPatronal && (
                                                <Typography color="textSecondary">
                                                    <span>Nro Mtess Patronal: </span>
                                                    {company.mtessPatronal}
                                                </Typography>
                                            )}
                                            {company.ips_patronal && (
                                                <Typography color="textSecondary">
                                                    <span>Nro Ips Patronal: </span>
                                                    {company.ips_patronal}
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

                                        <div className="max-w-220">

                                        <Typography color="textSecondary">
                                                <span>Nombre: </span>
                                                {employee.nombre}
                                            </Typography>

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
                                            {employee.celular && (
                                                <Typography color="textSecondary">
                                                    <span>Celular: </span>
                                                    {employee.celular}
                                                </Typography>
                                            )}
                                            {employee.sexo && (
                                                <Typography color="textSecondary">
                                                    <span>Sexo: </span>
                                                    {employee.sexo}
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
                                                    Amonestación
                                                </Typography>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-44 print:mt-0">

                                <Table className="simple">
                                    <TableBody>
                                        <TableRow>
                                        <TableCell>
                                                <Typography variant="subtitle1">Art. 227. A los efectos de este Código, salario significa la remuneración sea cual fuere su denominación o método de cálculo que pueda evaluarse en efectivo, debida por un empleador a un trabajador en virtud de los servicios u obras que éste haya efectuado o debe efectuar, de acuerdo con lo estipulado en el contrato de trabajo.<br />

Art. 228. El salario se estipulará libremente, pero no podrá ser inferior al que se establezca como mínimo de acuerdo con las prescripciones de la ley.<br />

Leer mas Art. 229 - 273<br />


                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {xml.sanciones}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="subtitle1">Fecha Amonestación</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {xml.fecha_amonestacion}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="subtitle1">Motivo Amonestación</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {xml.motivo_amonestacion}
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </div>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={9}>
                                    <div className="mt-96 print:mt-0 print:px-16">
                                        <Typography className="mb-24 print:mb-12" variant="body1">Firma RRHH: {firmas.rrhh}</Typography>
                                        <Typography className="mb-24 print:mb-12" variant="body1">Firma Director: {firmas.director}</Typography>
                                        <Typography className="mb-24 print:mb-12" variant="body1">Firma Empleado: {firmas.empleado}</Typography>
                                    </div>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <div className="mt-96 print:mt-0 print:px-16">
                                        {(<QRCode value={`${process.env.REACT_APP_MTESS_PORTAL_URL}/kudeamonestacion/${hashKude}`} />)}
                                    </div>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </FuseAnimate>
            )}
        </div>
    );
}

export default KudeAmonestacion;

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
