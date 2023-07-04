import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, TableCell, TableRow, TableBody, TableHead, Table, Button, Paper, Tooltip, IconButton, Icon, Grid } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { makeStyles } from '@material-ui/styles';

import { useSelector } from 'react-redux';


export default class ModernInvoicePageVacaciones extends React.Component {
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
        let formatAnho = (mes_de_pago) => {
            const endDay = new Date(mes_de_pago)
            return moment(endDay).local(momentESLocale).format("YYYY")
        }
        return (
        <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>
            <Card className="mx-auto w-xl print:w-full print:shadow-none">
                <CardContent className="p-88 print:p-0">
                    <Table>
                        <TableHead>
                            <tr>
                                <td>
                                    <img className="w-60 print:w-60" src={ process.env.REACT_APP_FACTURA_LOGO ? process.env.REACT_APP_FACTURA_LOGO : "assets/images/logos/logo_code100.png" } alt="logo" />
                                </td>
                                <td align="center" width="70%" colSpan="2">
                                    {this.state.company.razon_social && (
                                        <Typography className="font-light" variant="h5" color="textSecondary">
                                            {this.state.company.razon_social}
                                        </Typography>
                                    )}
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td></td>
                                <td align="center" colSpan="2">
                                    <Typography className="font-light" variant="h7" color="textSecondary">
                                        LIQUIDACION DE VACACIONES
                                    </Typography>
                                </td>
                            </tr>
                        </TableHead>
                        <TableBody>
                            <tr>
                                <td colSpan="2">
                                    {this.state.employee.legajo && (
                                        <Typography color="textSecondary">
                                            <span>Legajo: </span>
                                        </Typography>
                                    )}
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
                                <td colSpan="2">
                                    {this.state.company.ips && (
                                        <Typography color="textSecondary">
                                            {this.state.employee.legajo} {this.state.employee.nombres + " " + this.state.employee.apellidos}
                                        </Typography>
                                    )}
                                </td>
                                <td>
                                    <Typography color="textSecondary">
                                        Sueldo Básico:
                                    </Typography>
                                </td>
                                <td align="right">
                                    <Typography color="textSecondary">
                                        {formatter.format(this.state.employee.sueldoJornal)}
                                    </Typography>
                                </td>
                            </tr>
                        </TableBody>
                    </Table>
                    <div className="mt-44 print:mt-0" style={{marginTop: "10px"}}>
                        <Table className="simple">
                            {<TableHead>
                                <TableRow>
                                    <TableCell style={{padding: "0px"}}>
                                        Concepto
                                    </TableCell>
                                    <TableCell align="right" style={{padding: "0px"}}>
                                        unidades
                                    </TableCell>
                                    <TableCell align="right" style={{padding: "0px"}}>
                                        Haberes
                                    </TableCell>
                                    <TableCell align="right" style={{padding: "0px"}}>
                                        Deducciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>}
                            <TableBody>
                                {this.state.detail.map((details) => (
                                    <TableRow key={details.id}>
                                        <TableCell>
                                            <Typography variant="subtitle1">{details.descripcion}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="subtitle1">{details.cantidad}</Typography>
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
                                    <Typography className="font-medium" variant="subtitle2" color="textSecondary">Recibi conforme de la empresa, original e importe neto de la presente liquidación</Typography>
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell align="right">
                                    <Typography className="font-medium" variant="subtitle1" color="textSecondary">
                                        {formatter.format(this.state.invoice.total_ingresos)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography className="font-medium" variant="subtitle1" color="textSecondary">
                                        {formatter.format(this.state.invoice.total_retenciones)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Typography className="font-light" variant="h5" color="textSecondary">Neto a cobrar</Typography>
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell align="right">
                                    <Typography className="font-light" variant="h5" color="textSecondary">
                                        {formatter.format(this.state.invoice.total_neto)}
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
