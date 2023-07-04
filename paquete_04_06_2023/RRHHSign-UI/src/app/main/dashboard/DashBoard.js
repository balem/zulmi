import React, { useEffect, useMemo, useState } from 'react';
import { TableCell, TableRow, TableBody, TableHead, Table, Typography, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FuseUtils, FuseAnimate, FuseAnimateGroup } from '@fuse';

import clsx from 'clsx';
import axios from 'axios';
//import login from 'app/auth/store/reducers/login.reducer';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DocumentService from 'app/services/DocumentsService';
import EmployeeService from 'app/services/EmployeeService';
import { useDispatch } from "react-redux";
import { Chart } from "react-google-charts"; 

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as Actions from "app/store/actions";

const useStyles = makeStyles(theme => ({
    header: {
        background: 'linear-gradient(to right, ' + theme.palette.primary.dark + ' 0%, ' + theme.palette.primary.main + ' 100%)',
        color: theme.palette.primary.contrastText
    },
    panel: {
        margin: 0,
        borderWidth: '1px 1px 0 1px',
        borderStyle: 'solid',
        borderColor: theme.palette.divider,
        '&:first-child': {
            borderRadius: '16px 16px 0 0'
        },
        '&:last-child': {
            borderRadius: '0 0 16px 16px',
            borderWidth: '0 1px 1px 1px'
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {}
}));

function DashBoard() {
    const classes = useStyles();
    const dispatchMsg = useDispatch();

    const [data, setData] = useState([]);
    const [cantDoc, handleCantDoc] = useState(1);
    const [cantDocCom, handleCantDocCom] = useState(1);
    const [cantDocEnp, handleCantDocEnp] = useState(1);
    const [cantDocPen, handleCantDocPen] = useState(1);
    const [cantDocBar, handleCantDocBar] = useState([]);
    const [cantXML, handleCantXML] = useState(0);
    const [cantXMLFir, handleCantXMLFir] = useState(0);
    const [cantXMLNoFir, handleCantXMLNoFir] = useState(0);
    const [cantXMLMTESS, handleCantXMLMTESS] = useState(0);
    const [cantXMLBar, handleCantXMLBar] = useState([]);
    const [cantEmp, handleCantEmp] = useState([]);
    const [cantEmpCert, handleCantEmpCert] = useState([]);
    const [cantEmpCertNo, handleCantEmpCertNo] = useState([]);
    const [open, setOpen] = useState(false);

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let userRole = user.role[0];

    console.log('USER ', user)

    async function getDocCant() {
        var cantDoc = await DocumentService.getCantDoc();
        handleCantDoc(cantDoc.data.data[0].count);
    }

    async function getDocCantCom() {
        var cantDoc = await DocumentService.getCantDocCom();
        handleCantDocCom(cantDoc.data.data[0].count);
    }
    
    async function getDocCantEnp() {
        var cantDoc = await DocumentService.getCantDocEnp();
        handleCantDocEnp(cantDoc.data.data[0].count);
    }

    async function getDocCantPen() {
        var cantDoc = await DocumentService.getCantDocPen();
        handleCantDocPen(cantDoc.data.data[0].count);
    }

    async function getXMLCant() {
        var cantDoc = await DocumentService.getCantXML();
        handleCantXML(cantDoc.data.data[0].count);
    }

    async function getXMLCantFir() {
        var cantDoc = await DocumentService.getCantXMLFir();
        handleCantXMLFir(cantDoc.data.data[0].count);
    }

    async function getXMLCantNoFir() {
        var cantDoc = await DocumentService.getCantXMLNoFir();
        handleCantXMLNoFir(cantDoc.data.data[0].count);
    }

    async function getXMLCantMTESS() {
        var cantDoc = await DocumentService.getCantXMLMTESS();
        handleCantXMLMTESS(cantDoc.data.data[0].count);
    }

    async function getEmpCant() {
        var cantDoc = await EmployeeService.getCantEmp();
        handleCantEmp(cantDoc.data.data[0].count);
    }

    async function getEmpCantCert() {
        var cantDoc = await EmployeeService.getCantEmpCert();
        handleCantEmpCert(cantDoc.data.data[0].count);
    }

    async function getEmpCantCertCor() {
        var cantDoc = await EmployeeService.getCantEmpCertCor();
        handleCantEmpCertNo(cantDoc.data.data[0].count);
    }

    async function sendMails() {
        setOpen(true);
    }

    async function handleClose() {
        setOpen(false);
        DocumentService.sendMail();
    }

    async function handleCancelClose() {
        setOpen(false);
    }

    useEffect(() => {
        getDocCant();
        getDocCantCom();
        getDocCantEnp();
        getDocCantPen();
        getXMLCant();
        getXMLCantFir();
        getXMLCantNoFir();
        getXMLCantMTESS();
        getEmpCant();
        getEmpCantCert();
        getEmpCantCertCor();
    }, []);

    useEffect(() => {
        var porDoc = parseInt(cantDoc);
        if (porDoc > 1) {
            var data = [
                ["Lotes total", "Cantidad/Porcentaje"],
                ['Completados', parseInt(cantDocCom)],
                ['En proceso', parseInt(cantDocEnp)],
                ['Pendientes', parseInt(cantDocPen)],
            ];
            handleCantDocBar(data);
        }
    }, [cantDocPen, cantDocCom, cantDocEnp, cantDoc]);

    useEffect(() => {
        var porXML = parseInt(cantXML);
        if (porXML > 1) {
            var data = [
                ["Documentos total", "Cantidad/Porcentaje"],
                ['Firmados', parseInt(cantXMLFir)],
                ['No Firmados', parseInt(cantXMLNoFir)],
                ['Enviado MTESS', parseInt(cantXMLMTESS)],
            ];
            handleCantXMLBar(data);
            if (parseInt(cantXMLNoFir) > 0) {
                sendMails();
            }
        }
    }, [cantXML, cantXMLFir, cantXMLNoFir, cantXMLMTESS]);
    return (
        <div className="w-full flex flex-col flex-auto">
            <div className={clsx(classes.header, "flex flex-col flex-shrink-0 items-center justify-center text-center p-16 sm:p-24 h-600 sm:h-560")}>
                <Grid>
                    <Grid>
                        <Table>
                            <TableHead>
                                <tr>
                                    <td colSpan="4">
                                        <Typography color="inherit" className="text-36 sm:text-56 font-light">
                                            Estadísticas del Sistema
                                        </Typography>
                                    </td>
                                </tr>
                            </TableHead>
                            <TableBody>
                                <tr>
                                    <td style={{width: "40%", height: '50px'}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Lotes
                                        </Typography>
                                    </td>
                                    <td style={{width: "10%"}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantDoc}
                                        </Typography>
                                    </td>
                                    <td style={{width: "40%"}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Lotes Completados
                                        </Typography>
                                    </td>
                                    <td style={{width: "10%"}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantDocCom}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr> 
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Lotes En Proceso
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantDocEnp}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Lotes Pendientes
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantDocPen}
                                        </Typography>
                                    </td>                            
                                </tr>
                                <tr>
                                    <td style={{height: '50px'}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Recibos
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantXML}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Recibos Firmados
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantXMLFir}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{height: '50px'}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Recibos sin Firmar
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantXMLNoFir}
                                        </Typography>
                                    </td>
                                    
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Recibos enviados al MTESS
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantXMLMTESS}
                                        </Typography>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style={{height: '50px'}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Empleados
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantEmp}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Empleados con Certificado
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantEmpCert}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{height: '50px'}}>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            Cantidad de Empleados con Certificado Verificado
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="inherit" className="text-24 sm:text-24 font-light">
                                            {cantEmpCertNo}
                                        </Typography>
                                    </td>
                                    <td>
                                    </td>
                                    <td>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <Chart 
                                            width={'500px'}
                                            height={'300px'}
                                            chartType="PieChart"
                                            loader={<div>Loading Chart</div>}
                                            data={cantDocBar}
                                            options={{
                                                backgroundColor: 'transparent',
                                                is3D: true,
                                                legend: {textStyle: {color: 'white'}},
                                                titleTextStyle: { color: 'white' },
                                                title: 'Lotes: ' +cantDoc,
                                                chartArea: { width: '60%' },
                                                hAxis: {
                                                    title: 'Total lotes',
                                                    minValue: 0,
                                                },
                                                vAxis: {
                                                    title: 'Tipos',
                                                },
                                            }}/>
                                    </td>
                                    <td colSpan="2">
                                        <Chart 
                                            width={'500px'}
                                            height={'300px'}
                                            chartType="PieChart"
                                            loader={<div>Loading Chart</div>}
                                            data={cantXMLBar}
                                            options={{
                                                backgroundColor: 'transparent',
                                                is3D: true,
                                                legend: {textStyle: {color: 'white'}},
                                                titleTextStyle: { color: 'white' },
                                                title: 'Documentos: '+cantXML,
                                                chartArea: { width: '60%' },
                                                hAxis: {
                                                    title: 'Total Documentos',
                                                    minValue: 0,
                                                },
                                                vAxis: {
                                                    title: 'Tipos',
                                                },
                                            }}/>
                                    
                                    </td>
                                </tr>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
            </div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Envio de Mail</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Por favor, indique si desea enviar un email a los funcionarios que no han firmado sus recibos
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Enviar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DashBoard;
