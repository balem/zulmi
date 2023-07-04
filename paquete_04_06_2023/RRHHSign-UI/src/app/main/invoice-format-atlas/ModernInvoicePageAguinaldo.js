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
            detail: props.detail,
            xml: props.xml
        }
    }

    render() {
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
            /*const startDay = new Date(mes_de_pago)
            const endDay = new Date(mes_de_pago)
            startDay.setDate(1)
            endDay.setDate(1)
            endDay.setMonth(endDay.getMonth() + 1)
            endDay.setDate(0)
            return moment(startDay).local(momentESLocale).format("DD/MM/YYYY")
            + ' - '
            + moment(endDay).local(momentESLocale).format("DD/MM/YYYY")*/
            const startDay = new Date(mes_de_pago)
            return moment(startDay).local(momentESLocale).format("MM/YYYY")
        }
        return (
            <FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>
                <Card className="mx-auto w-xl print:w-full print:shadow-none">
                    <CardContent className="p-88 print:p-0">
                        <Table >
                            <TableHead>
                                <tr>
                                    <td>
                                        <img
                                            style={{ width: '100px' }}
                                            src={process.env.REACT_APP_FACTURA_LOGO ? process.env.REACT_APP_FACTURA_LOGO : "assets/images/logos/logo_code100.png"}
                                            alt="logo" />
                                    </td>
                                    <td>
                                        <Typography className="font-medium" variant="subtitle1" color="textSecondary" colSpan="3" align="center">
                                            Nro. Patronal {this.state.company.mtess_patronal}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Typography color="textSecondary">
                                            Apellido y Nombre
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            {this.state.employee.nombres + " " + this.state.employee.apellidos}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            Fecha de Pago 
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            {moment(this.state.invoice.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY")}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Typography color="textSecondary">
                                            Documento
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            {this.state.employee.identification}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            N° de Funcionario
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            {this.state.employee.legajo}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Typography color="textSecondary">
                                            N°Cuenta
                                        </Typography>
                                    </td>
                                    <td></td>
                                    <td>
                                        <Typography color="textSecondary">
                                            Salario Nominal
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            {formatter.format(this.state.employee.sueldoJornal)}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Typography color="textSecondary">
                                            Cargo
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color="textSecondary">
                                            {this.state.employee.cargo}
                                        </Typography>
                                    </td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan="4" align="center">
                                        <Typography>
                                            Recibo de {this.state.xml.identificator}
                                        </Typography>
                                    </td>
                                </tr>
                            </TableHead>
                            <TableBody>
                                <tr>
                                    <td align="center">Concepto</td>
                                    <td align="center"></td>
                                    <td align="center">Ingresos</td>
                                    <td align="center">Descuentos</td>
                                </tr>
                                {this.state.detail.map((details) => (
                                    <tr key={details.id}>
                                        <td>
                                            <Typography variant="subtitle1">{details.descripcion}</Typography>
                                        </td>
                                        <td align="center">
                                            <Typography variant="subtitle1">{details.cantidad}</Typography>
                                        </td>
                                        <td align="right">
                                            {formatter.format(details.ingresos)}
                                        </td>
                                        <td align="right">
                                            {formatter.format(details.retenciones)}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td>Sub-Total</td>
                                    <td></td>
                                    <td align="right">{formatter.format(this.state.invoice.total_ingresos)}</td>
                                    <td align="right">{formatter.format(this.state.invoice.total_retenciones)}</td>
                                </tr>
                                <tr>
                                    <td>Liquido a Cobrar</td>
                                    <td></td>
                                    <td></td>
                                    <td align="right">{formatter.format(this.state.invoice.total_neto)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="4">Recibí conforme de BANCO ATLAS S.A. el importe consignado en la presente liquidación en concepto de Salario correspondiente al mes de {formatPeriodoPago(this.state.invoice.fecha_de_pago)}</td>
                                </tr>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </FuseAnimate>
        )
    }
}