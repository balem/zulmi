import React, { useEffect, useState } from 'react';
import { Fab, Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon, Grid } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { makeStyles } from '@material-ui/styles';

import { useSelector } from 'react-redux';

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
import { result } from 'lodash';


const useStyles = makeStyles(theme => ({
    root: {
        background: 'radial-gradient(' + darken(theme.palette.primary.dark, 0.5) + ' 0%, ' + theme.palette.primary.dark + ' 80%)'
    },
    divider: {
        backgroundColor: theme.palette.divider
    }
}));

let formatter = new Intl.NumberFormat('es-PY', {
                style: 'currency',
                currency: 'PYG',
                minimumFractionDigits: 0
            }
        );


function Comunicacion(props) {
    const classes = useStyles();
    const [header, handleHeader] = useState({});
    const [detail, handleDetail] = useState([]);


    useEffect(() => {
        let values = fetch(process.env.REACT_APP_API_HOST + `/evidence/header`, {
            method: "GET",
			mode: "cors", 
			cache: "no-cache", 
			credentials: "same-origin", 
			headers: {
				"Content-Type": "application/json",
			},
			redirect: "follow", 
			referrerPolicy: "no-referrer"
        })
        .then(res => res.json())
        .then(
            (responseHeader) => {
                if (responseHeader.status === "success") {
                    var processedHeader = {
                        razon_social: responseHeader.data.company[0].razon_social,
                        ruc: responseHeader.data.company[0].ruc,
                        mtess_patronal: responseHeader.data.company[0].mtess_patronal,
                        hash: responseHeader.data.company[0].hash,
                        last_date: moment(new Date(responseHeader.data.company[0].last_data)).format('DD/MM/YYYY'),
                        document_id: responseHeader.data.company[0].document_id,
                        amount: responseHeader.data.company[0].cant
                    }
                    handleHeader(processedHeader);
                    return processedHeader;
                } else {
                    /* Fruta */
                }
            }
        ).then((responseHeader) => {
            fetch(process.env.REACT_APP_API_HOST + `/evidence/detail?id=${responseHeader.document_id}`, {
                method: "GET",
                mode: "cors", 
                cache: "no-cache", 
                credentials: "same-origin", 
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow", 
                referrerPolicy: "no-referrer"
            })
            .then(res => res.json())
            .then((responseDetail) => {
                var processedDetail = [];
                if (responseDetail.status === "success") {
                    for (let i = 0; i < responseDetail.data.details.length; i++) {
                        console.log("fecha envio mtess:"+responseDetail.data.details[i].envio_mtess_date)
                        processedDetail[i] = {
                            fecha: moment(responseDetail.data.details[i].envio_mtess_date.split("T")[0]).format('DD/MM/YYYY') +" "+ responseDetail.data.details[i].envio_mtess_date.split("T")[1].split(".")[0],
                            nombres: responseDetail.data.details[i].nombres+" "+responseDetail.data.details[i].apellidos,
                            indentification: responseDetail.data.details[i].identification,
                            total: responseDetail.data.details[i].total_neto,
                            hash: responseDetail.data.details[i].hash
                        }
                    }
                    handleDetail(processedDetail);
                } else {
                    /* fruta */
                }
            })
        })
    }, []);

    function DetailRow(values) {
        console.log(values);
        let result = values.detail.map((detail) => {
            return (
                <TableRow >
                    <TableCell className="text-center" style={{ border: "solid 1px black", padding: "0", height: '18px', fontSize: "10px", width: '120px' }}>
                        {detail.fecha}
                    </TableCell>
                    <TableCell className="text-center" style={{ border: "solid 1px black", padding: "0", height: '18px', fontSize: "10px", width: '200px' }}>
                        {detail.nombres}
                    </TableCell>
                    <TableCell className="text-center" style={{ border: "solid 1px black", padding: "0", height: '18px', fontSize: "10px", width: '100px' }}>
                        {detail.indentification}
                    </TableCell>
                    <TableCell className="text-center" style={{ border: "solid 1px black", padding: "0", height: '18px', fontSize: "10px", width: '100px' }}>
                        {formatter.format(detail.total)}
                    </TableCell>
                    <TableCell className="text-center" style={{ border: "solid 1px black", padding: "0", height: '18px', fontSize: "10px", width: '320px' }}>
                        {detail.hash}
                    </TableCell>
                </TableRow>
            )
        })
        return result;
    }

    return (
        <div className={clsx(classes.root, "flex-grow flex-shrink-0 p-0 sm:p-64 print:p-0")}>
            <Paper className="p-12 mb-24 hidden-print">
                <Tooltip title="Volver" placement="top">
                    <IconButton
                        onClick={() => { props.history.goBack() }}
                    >
                        <Icon>arrow_back</Icon>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Generar PDF" placement="top">
                    <IconButton
                        onClick={() => { window.print() }}
                    >
                        <Icon>cloud_download</Icon>
                    </IconButton>
                </Tooltip>
            </Paper>
            <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>
                <Card className="mx-auto w-xl print:w-full print:shadow-none">
                    <CardContent className="p-88 print:p-0" style={{ display: "block", height: "1011px" }}>
                        <div className="flex justify-end items-center w-800 print:w-600">
                            <img className="w-160 print:w-60" src={process.env.REACT_APP_FACTURA_LOGO ? process.env.REACT_APP_FACTURA_LOGO : "assets/images/logos/logo_code100.png"} alt="logo" />
                            <Typography className="font-light text-right" variant="h5" color="textSecondary">
                                ACTA DE COMUNICACIÓN
                                </Typography>
                        </div>
                        <div className="flex flex-row justify-between items-start">
                            <div className="flex flex-col" style={{ display: "inline-block", width: "100%", height: "80px" }}>
                                <div style={{ position: "relative", float: "left", width: "49%" }}>
                                    <div >
                                        <Typography color="textSecondary">
                                            <span>Razón Social: </span>
                                            {header.razon_social}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            <span>RUC: </span>
                                            {header.ruc}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*<div style={{ display: "inline-block", width: "100%", marginTop: "10px" }}>
                            <Table style={{ width: "100%" }}>
                                {<TableHead>
                                    <TableRow>
                                        <TableCell align="center" style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            MTESS PATRONAL
                                            </TableCell>
                                        <TableCell align="center" style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            LLAVE
                                            </TableCell>
                                    </TableRow>
                                </TableHead>}
                                <TableBody>
                                    {<TableRow >
                                        <TableCell className="text-center" style={{ border: "solid 1px black", padding: "0", height: '18px', width: '60px', fontSize: "10px" }}>
                                            {header.mtess_patronal}
                                        </TableCell>
                                        <TableCell style={{ border: "solid 1px black", padding: "0", height: '18px', fontSize: "10px", width: '320px', marginLeft: '12px' }}>
                                            {header.hash}
                                        </TableCell>
                                    </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </div>*/}
                        <div style={{ display: "inline-block", width: "100%", marginTop: "10px" }}>
                            <Table style={{ width: "100%" }}>
                                {<TableHead>
                                    <TableRow>
                                        <TableCell align="center" colSpan='3' style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            FECHA EVIDENCIA
                                            </TableCell>
                                        <TableCell align="center" colSpan='2' style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            CANTIDAD DE RECIBOS
                                            </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center" colSpan='3' style={{ border: "solid 1px black", padding: "0", height: '14px', fontSize: "10px" }}>
                                            {header.last_date}
                                        </TableCell>
                                        <TableCell align="center" colSpan='2' style={{ border: "solid 1px black", padding: "0", height: '14px', fontSize: "10px" }}>
                                            {header.amount}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center" style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            FECHA ENVIO
                                        </TableCell>
                                        <TableCell align="center" style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            NOMBRE COMPLETO
                                        </TableCell>
                                        <TableCell align="center" style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            CEDULA IDENTIDAD
                                            </TableCell>
                                        <TableCell align="center" style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            NETO A COBRAR
                                            </TableCell>
                                        <TableCell align="center" style={{ border: "solid 1px black", padding: "0", backgroundColor: "#c0c0c0", height: '14px', fontSize: "10px" }}>
                                            IDENTIFICACIÓN XML
                                            </TableCell>
                                    </TableRow>
                                </TableHead>}
                                <TableBody>
                                    <DetailRow detail={detail}/>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </FuseAnimate>
        </div>
    )
}


export default Comunicacion;