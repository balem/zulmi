import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    TableCell, 
    TableRow, 
    TableBody, 
    TableHead, 
    Table
} from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { makeStyles } from '@material-ui/styles';

import { useSelector } from 'react-redux';

export default class ModernInvoicePageAguinaldo extends React.Component {
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
            const endDay = new Date(mes_de_pago)
            startDay.setDate(1)
            endDay.setDate(1)
            endDay.setMonth(endDay.getMonth() + 1)
            endDay.setDate(0)
            return moment(startDay).local(momentESLocale).format("DD/MM/YYYY") + ' - ' + moment(endDay).local(momentESLocale).format("DD/MM/YYYY")
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
                                <td colSpan="2" align="center">
                                    {this.state.company.razon_social && (
                                        <Typography className="font-light" variant="h5" color="textSecondary">
                                            {this.state.company.razon_social}
                                        </Typography>
                                    )}
                                </td>
                                <td></td>

                            </tr>
                        </TableHead>
                        <TableBody>
                            <tr>
                                <td></td>
                                <td align="center">
                                    <Typography className="font-light" variant="h7" color="textSecondary">
                                        AGUINALDO Año: {formatAnho(this.state.invoice.mes_de_pago)}
                                    </Typography>
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    {this.state.employee.legajo && (
                                        <Typography color="textSecondary">
                                            <span>Legajo: </span>
                                            {this.state.employee.legajo}
                                        </Typography>
                                    )}
                                </td>
                                <td>
                                    <Typography color="textSecondary">
                                        Trabajador: {this.state.employee.nombres + " " + this.state.employee.apellidos}
                                    </Typography>  
                                </td>
                                <td align="right">
                                    {moment(this.state.invoice.fecha_de_pago).local(momentESLocale).format("MM [de] YYYY")}
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
                                        Unidades
                                    </TableCell>
                                    {/* <TableCell align="right">
                                        ACLARACION
                                    </TableCell> */}
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
                                            {formatter.format(details.ingresosNo)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {formatter.format(details.retenciones)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell align="right">
                                        {formatter.format(this.state.invoice.total_ingresos_no)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatter.format(this.state.invoice.total_retenciones)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell align="right">
                                        Neto a Cobrar
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatter.format(this.state.invoice.total_ingresos)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Typography variant="subtitle1">
                                        Recibi conforme de la empresa, original e importe neto de la presente liquidación. Son Guaranies: {this.state.invoice.neto_en_letras}
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