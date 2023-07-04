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
            document: props.document,
            detail: props.detail,
            xml: props.xml
        }
    }

    render () {

        let sum_ingresos = 0;
        let sum_descuentos = 0;

        this.state.detail.map((details) => {
                sum_ingresos = sum_ingresos+details.ingresos
                sum_descuentos = sum_descuentos+details.retenciones            
        })

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
                    <Table>
                        <TableHead>
                            <tr>
                                <td className="w-90 print:w-90" >
                                    <img  
                                        style={{width: '100px'}}
                                        src={ process.env.REACT_APP_FACTURA_LOGO ? process.env.REACT_APP_FACTURA_LOGO : "assets/images/logos/logo_code100.png" } 
                                        alt="logo" />
                                </td>
                                <td>
                                    <Typography className="font-light" variant="h6" style={{textAlign: 'center', fontWeight: 'bold'}}>
                                        Recibo de Salario
                                    </Typography>
                                </td>
                                <td>
                                    <Typography style={{textAlign: 'right', fontSize: '12px'}}>
                                        <span style={{fontWeight: 'bold'}}> Registro Patronal: </span> {this.state.employee.mtess_patronal && (
                                        <span>{this.state.employee.mtess_patronal}</span>
                                    )}
                                    </Typography>
                                     
                                        <Typography align="right" style={{textSize: '1.2rem'}}>
                                            <span style={{textAlign: 'center', fontWeight: 'bold'}}>RUC: </span>
                                            80002201-7
                                        </Typography>
                                    
                                </td>
                            </tr>
                           
                        </TableHead>
                    </Table>
                    <Table>
                        <TableHead>
                            <tr colSpan={1}>
                                <td>
                                    <Typography className="font-light" variant="p" color="textSecondary" style={{textAlign: 'center'}}>
                                        Conforme Art. 235 Código del trabajo
                                    </Typography>
                                </td>
                                 <td colSpan={2} align="center" style={{"borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}}>                             
                                    <Typography className="font-light" variant="p" align="right" color="textSecondary" style={{textAlign: 'center', fontWeight: 'bold'}}>
                                        Periodo de Pago
                                    </Typography>
                                </td>
                            </tr>
                        </TableHead>
                        <TableBody>
                            <tr>
                                <td>{this.state.document.observacion && (
                                        <span style={{fontSize: '12px',fontWeight: 'bold'}}>{this.state.document.observacion}</span>
                                    )}
                                </td>
                                <td align="center" style={{"borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}}>
                                    <Typography>
                                        {moment(this.state.document.fecha_inicial).local(momentESLocale).format("DD/MM/YYYY")}
                                    </Typography>
                                </td>
                                <td align="center" style={{"borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}}>
                                    <Typography>
                                        {moment(this.state.document.fecha_final).local(momentESLocale).format("DD/MM/YYYY")}
                                    </Typography>
                                </td>
                            </tr>
                        </TableBody>
                    </Table>
                    <Table style={{"borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}}>
                        <TableBody>
                            <tr>
                                <td>
                                <Typography style={{width: '65%', textAlign: 'left', fontSize: '12px'}}>
                                    <span style={{fontWeight: 'bold'}}> Nombre: </span> {this.state.employee.nombres && (
                                        <span>{this.state.employee.nombres + " " + this.state.employee.apellidos}</span>
                                    )}
                                </Typography>
                                </td>
                                <td>
                                        <Typography style={{width: '65%', textAlign: 'left', fontWeight: 'bold', fontSize: '12px'}}>
                                            <span>Nro. Recibo:</span>
                                        </Typography>
                                </td>
                                <td align="right">
                                    {this.state.xml.numero_recibo && (
                                            <span style={{fontSize: '12px'}}>{this.state.xml.numero_recibo}</span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                 <td>
                                    <Typography style={{textAlign: 'left', fontSize: '12px'}}>
                                    <span style={{fontWeight: 'bold'}}> Ced. Id: </span> {this.state.employee.identification && (
                                        <span>{this.state.employee.identification}</span>
                                    )}
                                    </Typography>
                                </td>
                                <td>
                                    <Typography>
                                        <span style={{textAlign: 'center', fontWeight: 'bold', fontSize: '12px'}}>Fecha de pago: </span>
                                    </Typography>
                                </td>
                                <td align="right">
                                {this.state.invoice.fecha_de_pago &&(
                                        <Typography color="textSecondary">
                                           <span style={{fontSize: '12px'}}>
                                           {moment(this.state.invoice.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY")}</span>
                                        </Typography>
                                )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Typography style={{textAlign: 'left', fontSize: '12px'}}>
                                        <span style={{fontWeight: 'bold'}}> Nro. Cta. Crédito: </span> {this.state.employee.number_count && (
                                            <span>{this.state.employee.number_count}</span>
                                        )}
                                    </Typography>
                                </td>
                                <td>
                                        <Typography>
                                            <span style={{textAlign: 'center', fontWeight: 'bold', fontSize: '12px'}}>Salario Básico Mensual: </span>
                                        </Typography>
                                </td>
                                <td align="right">
                                        {this.state.employee.sueldoJornal && (
                                        <Typography color="textSecondary">
                                            <span style={{fontSize: '12px'}}>{formatter.format(this.state.xml.salario_mensual)}</span>
                                        </Typography>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                <Typography style={{textAlign: 'left', fontSize: '12px'}}>
                                        <span style={{fontWeight: 'bold'}}> Sucursal: </span> {this.state.employee.sucursal && (
                                            <span>{this.state.employee.sucursal}</span>
                                        )}
                                    </Typography>
                                </td>
                                <td>
                                        <Typography>
                                            <span style={{textAlign: 'center', fontWeight: 'bold', fontSize: '12px'}}>Nro. Padrón: </span>
                                        </Typography>    
                                </td>
                                <td align="right">
                                 {this.state.employee.nro_padron && (
                                        <Typography color="textSecondary">
                                            <span style={{fontSize: '12px'}}>{this.state.employee.nro_padron}</span>
                                        </Typography>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Typography style={{textAlign: 'left', fontSize: '12px'}}>
                                        <span style={{fontWeight: 'bold'}}> Cargo: </span> {this.state.employee.cargo && (
                                            <span>{this.state.employee.cargo}</span>
                                        )}
                                    </Typography>
                                </td>
                            </tr>
                        </TableBody>
                    </Table>
                    <div >
                        <Table>
                            <TableHead style={{height: '10%'}}>
                                 <tr>
                                    <th style={{width: '5%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">
                                        <Typography className="font-light" style={{textAlign: 'center',fontWeight: 'bold', fontSize: '10px'}}>
                                            Id.
                                        </Typography>
                                    </th>
                                    <th style={{width: '60%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '10px'}}>
                                            CONCEPTO
                                        </Typography>
                                    </th>
                                    <th style={{width: '1%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '10px'}}>
                                            Días/Hs. Cuotas
                                        </Typography>
                                    </th>
                                    <th style={{width: '1%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '10px'}}>
                                            Cant. Cuotas
                                        </Typography>
                                    </th>
                                    <th style={{width: '50%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '10px'}}>
                                            REMUNERACION
                                        </Typography>
                                    </th>
                                    <th style={{width: '50%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '10px'}}>
                                            DESCUENTOS
                                        </Typography>
                                    </th>
                                </tr>
                            </TableHead>
                            <TableBody>
                                {this.state.detail.map((details) => (
                                    <TableRow key={details.id} style={{height: 5}}>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography variant="p" >{details.codigo}</Typography>
                                        </TableCell>
                                        <TableCell align="left" style={{fontSize: '12px'}}>
                                            <Typography variant="p" >{details.descripcion}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography variant="p">{details.cantidad}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography variant="p" >{details.cantidad}</Typography>
                                        </TableCell>
                                        <TableCell align="right" style={{fontSize: '12px'}}>
                                            <Typography variant="p">{formatter.format(details.ingresos)}</Typography>
                                        </TableCell>
                                        <TableCell align="right" style={{fontSize: '12px'}}>
                                            <Typography variant="p">{formatter.format(details.retenciones)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Table className="simple">
                        <TableBody>
                            <TableRow>
                                <TableCell align="left" colSpan={1}>

                                </TableCell>
                                 <TableCell align="right" colSpan={3}>
                                    <Typography>
                                        <span style={{textAlign: 'center', fontWeight: 'bold', fontSize: '12px'}}>Total:</span>
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" colSpan={1}>
                                    <Typography style={{fontSize: '12px'}}>
                                        {formatter.format(sum_ingresos)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" colSpan={1}>
                                    <Typography style={{fontSize: '12px'}}>
                                        {formatter.format(sum_descuentos)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow style={{width: '50%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}}>
                                <TableCell>
                                </TableCell>
                                <TableCell colSpan={6}>
                                    <Typography align="right">
                                        <span style={{textAlign: 'right', fontWeight: 'bold'}}>Neto a Percibir: </span> 
                                        {formatter.format(this.state.invoice.total_neto)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    <Typography className="font-light" variant="subtitle2" color="textSecondary" style={{fontSize: '12px'}}>NETO EN LETRAS</Typography>
                                    <Typography className="font-light" variant="subtitle2" color="textSecondary" style={{fontSize: '12px'}}>
                                        {this.state.invoice.neto_en_letras}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography className="font-light" variant="subtitle2" color="textSecondary" style={{textAlign: 'left', fontWeight: 'bold'}}>
                                        Recibí conforme del Banco Itaú Paraguay S.A. el importe neto de la presente liquidación y copia de la misma con firma y sello de mi Empleador
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