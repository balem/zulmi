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
            detail: props.detail,
            xml: props.xml
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
                                <td className="w-70 print:w-70" >
                                    <img className="w-60 print:w-60" 
                                        src={ process.env.REACT_APP_FACTURA_LOGO ? process.env.REACT_APP_FACTURA_LOGO : "assets/images/logos/logo_code100.png" } 
                                        alt="logo" />
                                </td>
                                <td style={{width: '70%'}}>
                                    {this.state.company.razon_social && (
                                        <Typography className="font-light" variant="h4" color="textSecondary" style={{textAlign: 'center', display: 'contents'}}>
                                            {this.state.company.razon_social}
                                        </Typography>
                                    )}
                                </td>
                                <td>
                                    {this.state.company.ruc && (
                                        <Typography color="textSecondary" style={{textSize: '1.2rem'}}>
                                            <span>RUC: </span>
                                            {this.state.company.ruc}
                                        </Typography>
                                    )}
                                    {this.state.company.ips && (
                                        <Typography color="textSecondary" style={{textSize: '1.2rem'}}>
                                            <span>Nro MTESS: </span>
                                            {this.state.employee.mtess_patronal}
                                        </Typography>
                                    )}
                                    {this.state.company.ips && (
                                        <Typography color="textSecondary" style={{textSize: '1.2rem'}}>
                                            <span>Nro. IPS: </span>{this.state.company.ips}
                                        </Typography>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <Typography className="font-light" variant="h6" color="textSecondary" style={{textAlign: 'center'}}>
                                        AGUINALDO AÑO <formatAnho mes_de_pago={this.state.invoice.fecha_de_pago}/>
                                    </Typography>
                                </td>
                                <td>
                                    <Typography color="textSecondary">
                                        NUMERO DE RECIBO
                                    </Typography>
                                    <Typography>
                                        {this.state.invoice.numero_recibo}
                                    </Typography>
                                </td>
                            </tr>
                        </TableHead>
                    </Table>
                    <Table>
                        <TableBody>
                            <tr>
                                <td style={{width: '15%'}}>
                                    <Typography color="textSecondary">
                                        <span>Legajo: </span>
                                    </Typography>
                                    {
                                    this.state.employee.legajo && (
                                        <Typography color="textSecondary">
                                            {this.state.employee.legajo}
                                        </Typography>
                                    )}
                                </td>
                                <td style={{width: '60%'}}>
                                    <Typography color="textSecondary">
                                        Trabajador: {this.state.employee.nombres + " " + this.state.employee.apellidos}
                                    </Typography>
                                </td>
                                <td style={{width: '15%'}}>
                                    <Typography></Typography>
                                </td>
                                <td>
                                    <Typography>
                                        {moment(this.state.invoice.fecha_de_pago).local(momentESLocale).format("DD/MM/YYYY")}
                                    </Typography>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {this.state.employee.identification && (
                                        <Typography color="textSecondary">
                                            <span>CI: </span>
                                            {this.state.employee.identification}
                                        </Typography>
                                    )}
                                </td>
                                <td>
                                    {this.state.employee.email && (
                                        <Typography color="textSecondary">
                                            <span>Correo: </span>
                                            {this.state.employee.email}
                                        </Typography>
                                    )}
                                </td>
                                <td>
                                    {this.state.employee.ips_empleado && (
                                        <Typography color="textSecondary">
                                            <span>IPS: </span>
                                            {this.state.employee.ips_empleado}
                                        </Typography>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    {this.state.xml.observation && (
                                        <Typography color="textSecondary">
                                            {this.state.xml.observation }
                                        </Typography>
                                    )}
                                </td>
                                <td colSpan={2}>
                                    {this.state.company.director && (
                                        <Typography color="textSecondary">
                                            <span>Empleador: </span>
                                            {this.state.company.director}
                                        </Typography>
                                    )}
                                </td>
                            </tr>
                        </TableBody>
                    </Table>
                    <div className="mt-44 print:mt-0">
                        <span className="articulo-ley">
                            {/* <b>Liquidación de salario conforme al Art. 236 del Código laboral <br /></b> */}
                            {/* <b>Art. 227.</b> A los efectos de este Código, salario significa la remuneración sea cual fuere su denominación o método de cálculo que pueda evaluarse en efectivo, debida por un empleador a un trabajador en virtud de los servicios u obras que éste haya efectuado o debe efectuar, de acuerdo con lo estipulado en el contrato de trabajo. <br /> */}
                            {/* <b>Art. 228.</b> El salario se estipulará libremente, pero no podrá ser inferior al que se establezca como mínimo de acuerdo con las prescripciones de la ley. <br /> */}
                            {/* Leer mas Art. 229 - 273 */}
                            {/* <b>Art. 350.</b> El Reglamento Interno de Trabajo es el conjunto de disposiciones obligatorias acordadas por igual número de representantes del empleador y de sus trabajadores, destinado a regular el orden, la disciplina y la seguridad, necesarios para asegurar la productividad de la empresa y la buena ejecución de las labores en los establecimientos de trabajo.<br /> */}
                            {/* <b>Art. 351.</b> El empleador está autorizado a formular directamente las normas administrativas y técnicas relativas al mejoramiento de la productividad y al debido funcionamiento de su empresa. Estas reglas no forman parte del Reglamento Interno.<br /> */}
                            {/* <a href="https://www.ilo.org/dyn/natlex/docs/WEBTEXT/35443/64905/S93PRY01.htm" target="_blank">Leer mas 352 a 357</a><br /> */}
                        </span>
                        <Table>
                            {<TableHead>
                                <TableRow>
                                    <TableCell style={{padding: 0, width: '40%'}}>
                                        CONCEPTO
                                    </TableCell>
                                    <TableCell align="right" style={{padding: 0}}>
                                        UNIDADES
                                    </TableCell>
                                    {/* <TableCell align="right">
                                        ACLARACION
                                    </TableCell> */}
                                    <TableCell align="center" style={{padding: 0}}>
                                        HABERES
                                    </TableCell>
                                    <TableCell align="center" style={{padding: 0}}>
                                        DEDUCCIONES
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
                                            {formatter.format(details.retenciones)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Table className="simple">
                        <TableBody>
                            <TableRow>
                                <TableCell style={{width: '60%'}}>
                                    
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell align="right" colSpan={2}>
                                    <Typography>
                                        Neto a cobrar: {formatter.format(this.state.invoice.total_neto)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    <Typography className="font-light" variant="subtitle2" color="textSecondary">NETO EN LETRAS</Typography>
                                    <Typography className="font-light" variant="subtitle2" color="textSecondary">
                                        {this.state.invoice.neto_en_letras}
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