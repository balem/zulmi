import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon, Grid } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { makeStyles } from '@material-ui/styles';

import { useSelector } from 'react-redux';

export default class ModernInvoicePagePago extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employee: props.employee,
            company: props.company,
            invoice: props.invoice,
            detail: props.detail
        }
    }

    render () {
        let classes = makeStyles(theme => ({
            root: {
                background: 'radial-gradient(' + darken(theme.palette.primary.dark, 0.5) + ' 0%, ' + theme.palette.primary.dark + ' 80%)'
            },
            divider: {
                backgroundColor: theme.palette.divider
            }
        }))
        
        let formatter = new Intl.NumberFormat('es-PY', {
                style: 'currency',
                currency: 'PYG',
                minimumFractionDigits: 0
            }
        );
        let formatPeriodoPago = (mes_de_pago) => {
            const startDay = new Date(mes_de_pago)
            startDay.setDate(1)
            return moment(startDay).local(momentESLocale).format("MM [del] YYYY");
        }

        const ipsFormatter = val => {
            let str = String(val)
            str = str.padStart(11, "0");
            return str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6)
        }

        return (
        <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>
            <Card className="mx-auto w-xl print:w-full print:shadow-none">
                <CardContent className="p-88 print:p-0">
                    <Table>
                        <TableHead>
                            <tr>
                                <td className="w-60 print:w-60" >
                                    <img style={{width: "100px"}}
                                        src={ process.env.REACT_APP_FACTURA_LOGO ? process.env.REACT_APP_FACTURA_LOGO : "assets/images/logos/logo_code100.png" } 
                                        alt="logo" />
                                </td>
                                <td></td>
                                <td align="center" width="60%">
                                    {this.state.company.razon_social && (
                                        <Typography className="font-light" variant="h5" color="textSecondary">
                                            {this.state.company.razon_social}
                                        </Typography>
                                    )}
                                </td>
                                <td colSpan="2">
                                    <Typography className="font-light" variant="h7" color="textSecondary">
                                        RECIBO CONCEPTOS DE PAGO
                                    </Typography>
                                </td>
                            </tr>
                        </TableHead>
                        <TableBody>
                            <tr>
                                <td>
                                    {this.state.employee.legajo && (
                                        <Typography color="textSecondary">
                                            <span>
                                                Legajo:
                                            </span>
                                        </Typography>
                                    )}
                                </td>
                                <td align="left">
                                    {this.state.employee.legajo && (
                                        <Typography color="textSecondary">
                                            <span>
                                                {this.state.employee.legajo}
                                            </span>
                                        </Typography>
                                    )}
                                </td>
                                <td>
                                    <Typography color="textSecondary">
                                        {this.state.employee.nombres + " " + this.state.employee.apellidos}
                                    </Typography>
                                </td>
                                <td width="20%">
                                    <Typography>
                                        Mes {formatPeriodoPago(this.state.invoice.mes_de_pago)}
                                    </Typography>
                                </td>
                                <td align="right">
                                    <Typography>
                                        {moment(this.state.invoice.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY")}
                                    </Typography>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Typography color="textSecondary">
                                        C.Costo
                                    </Typography>
                                </td>
                                <td>
                                    <Typography>
                                        002
                                    </Typography>
                                </td>
                                <td>
                                    <Typography>
                                        SG&A
                                    </Typography>
                                </td>
                                <td>
                                    <Typography color="textSecondary">
                                        SUELDO BASICO
                                    </Typography>
                                </td>
                                <td>
                                    <Typography>
                                        {formatter.format(this.state.employee.sueldoJornal)}
                                    </Typography>
                                </td>
                            </tr>
                        </TableBody>
                    </Table>
                    <div className="mt-44 print:mt-0" style={{marginTop: "10px"}}>
                        <Table className="simple">
                            {<TableHead>
                                <TableRow style={{height: "10px", padding: "0px"}}>
                                    <TableCell style={{padding: "0px"}}>
                                    </TableCell>
                                    <TableCell align="right" style={{padding: "0px"}}>
                                    </TableCell>
                                    {/* <TableCell align="right">
                                        ACLARACION
                                    </TableCell> */}
                                    <TableCell align="center" colSpan="2" style={{padding: "0px"}}>
                                        Haberes
                                    </TableCell>
                                    <TableCell align="right" style={{padding: "0px"}}>
                                    </TableCell>
                                </TableRow>
                                <TableRow style={{height: "10px"}} style={{padding: "0px"}}>
                                    <TableCell style={{padding: "0px"}}>
                                        Concepto
                                    </TableCell>
                                    <TableCell align="center" style={{padding: "0px"}}>
                                        Unidades
                                    </TableCell>
                                    {/* <TableCell align="right">
                                        ACLARACION
                                    </TableCell> */}
                                    <TableCell align="center" style={{padding: "0px"}}>
                                        Deducibles
                                    </TableCell>
                                    <TableCell align="center" style={{padding: "0px"}}>
                                        No deducibles
                                    </TableCell>
                                    <TableCell align="center" style={{padding: "0px"}}>
                                        Deducciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>}
                            <TableBody>
                                {this.state.detail.map((details) => (
                                    <TableRow key={details.id}>
                                        <TableCell>
                                            <Typography variant="subtitle1">{details.descripcion}</Typography>
                                            {/* <Typography variant="caption" color="textSecondary">{details.detail}</Typography> */}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="subtitle1">{details.cantidad}</Typography>
                                            {/* <Typography variant="caption" color="textSecondary">{details.detail}</Typography> */}
                                        </TableCell>
                                        {/* <TableCell align="right">
                                            {details.aclaracionConcepto}
                                        </TableCell> */}
                                        <TableCell align="right">
                                            {formatter.format(details.ingresos)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {formatter.format(details.ingresosNo)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {formatter.format(details.retenciones)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle1">Recibi conforme de la empresa, original e importe neto de la presente liquidación</Typography>
                                        {/* <Typography variant="caption" color="textSecondary">{details.detail}</Typography> */}
                                    </TableCell>
                                    <TableCell align="right"></TableCell>
                                    <TableCell align="right">
                                        {formatter.format(this.state.invoice.total_ingresos)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatter.format(this.state.invoice.total_ingresos_no)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatter.format(this.state.invoice.total_retenciones)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography className="font-light" variant="h5" color="textSecondary">Neto a cobrar</Typography>
                                    </TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell align="right">
                                        <Typography className="font-light" variant="h5" color="textSecondary">
                                            {formatter.format(this.state.invoice.total_neto)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography variant="subtitle1">
                                            Son Guaranies: {this.state.invoice.neto_en_letras}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </FuseAnimate>
        )
    }
}