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
                                        <Typography className="font-medium" variant="subtitle1" color="textSecondary" colSpan="2">
                                            RECIBO DE PAGO DE SALARIO
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}>Fecha</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}>
                                        <Typography>
                                            {moment(this.state.invoice.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY")}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center">Legajo</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center" colSpan="2">Apellido y Nombre</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}></td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center" colSpan="2">Asignación Básica</td>
                                </tr>
                                <tr>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}>
                                        {
                                        this.state.employee.legajo && (
                                            <Typography color="textSecondary">
                                                {this.state.employee.legajo}
                                            </Typography>
                                        )}
                                    </td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} colSpan="2">
                                        <Typography color="textSecondary">
                                            {this.state.employee.nombres + " " + this.state.employee.apellidos}
                                        </Typography>
                                    </td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}></td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} colSpan="2">
                                        <Typography>
                                            {formatter.format(this.state.employee.sueldoJornal)}
                                        </Typography>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center" colSpan="2">Concepto</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center">Días / Hor.</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center">Haberes</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center">Descuentos</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center">Retenciones</td>
                                </tr>
                            </TableHead>
                            <TableBody>
                                {this.state.detail.map((details) => (
                                    <tr key={details.id}>
                                        <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} colSpan="2">
                                            <Typography variant="subtitle1">{details.descripcion}</Typography>
                                        </td>
                                        <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="right">
                                            <Typography variant="subtitle1">{details.cantidad}</Typography>
                                        </td>
                                        <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="right">
                                            {formatter.format(details.ingresos)}
                                        </td>
                                        <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="right">
                                            {formatter.format(details.ingresosNo)}
                                        </td>
                                        <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="right">
                                            {formatter.format(details.retenciones)}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} colSpan="2"></td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="center">TOTALES</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="right">{formatter.format(this.state.invoice.total_ingresos)}</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}></td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="right">{formatter.format(this.state.invoice.total_retenciones)}</td>
                                </tr>
                                <tr>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} colSpan="3"></td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}></td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}}>Neto a Cobrar</td>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} align="right">{formatter.format(this.state.invoice.total_neto)}</td>
                                </tr>
                                <tr>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} colSpan="6">Son Guaranies: {this.state.invoice.neto_en_letras}</td>
                                </tr>
                                <tr>
                                    <td style={{"borderWidth":"1px", 'borderColor':"#000", 'borderStyle':'solid'}} colSpan="6">Recibí conforme de LDC Paraguay S.A. la cantidad de Guaranies que se mencionan por los conceptos que anteceden, así como el duplicado de esta liquidación con la firma del empleador</td>
                                </tr>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </FuseAnimate>
        )
    }
}