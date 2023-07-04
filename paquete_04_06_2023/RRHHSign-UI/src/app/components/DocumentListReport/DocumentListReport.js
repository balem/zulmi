import React, { useEffect, useState } from 'react';
import { Card, CardContent, TableCell, TableRow, TableBody, TableHead, Table, Grid,
 IconButton, Icon, Typography, Tooltip, ListItem, Paper, Checkbox } from '@material-ui/core';
import Chip from 'app/components/Chip';
import { grey, red, green, blue, amber } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import moment from "moment";
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import momentESLocale from "moment/locale/es";
import DataTable, { ExpanderComponentProps } from 'react-data-table-component';
import "./styles.css";



export default class DocumentListReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            xml: props.registro,
        }
    }

    render () {

        let columns = [
            {
                name: 'Recibo',
                id: 'recibo',
                sortable: true,
                center: true,
                maxWidth: "5px",
                selector: row => row.recibo,
            },
            {
                name: 'Mes',
                id: 'mes',
                sortable: true,
                center: true,
                maxWidth: "5px",
                selector: row => row.mes,
            },
            {
                name: 'Tipo',
                id: 'tipo',
                sortable: true,
                left: true,
                maxWidth: "5px",
                selector: row => row.tipo,
            },
            {
                name: 'Suc.',
                id: 'sucursal',
                sortable: true,
                left: true,
                maxWidth: "20px",
                selector: row => row.sucursal,
            },
            {
                name: 'Empleado',
                id: 'empleado',
                sortable: true,
                left: true,
                maxWidth: "300px",
                selector: row => row.empleado,
            },
            {
                name: 'Firma Director',
                id: 'firmadir',
                sortable: true,
                left: true,
                maxWidth: "175px",
                selector: row => row.firmadir,
            },
            {
                name: 'Firma Empleado',
                id: 'firmaemp',
                sortable: true,
                left: true,
                maxWidth: "175px",
                selector: row => row.firmaemp,
            },
            {
                name: 'Envio Mtess',
                id: 'envio',
                sortable: true,
                left: true,
                maxWidth: "175px",
                selector: row => row.envio,
            },

        ];

        let data = [];

        for (var i = 0; i < this.state.xml.length; i++) {
            var rows = {
                    recibo: this.state.xml[i].numero_recibo,
                    mes: moment(this.state.xml[i].periodo).format("MM/YYYY"),
                    tipo: this.state.xml[i].identificator,
                    sucursal: this.state.xml[i].sucursal,
                    empleado: this.state.xml[i].nombres+" "+this.state.xml[i].apellidos,
                    firmaemp: this.state.xml[i].signature_employee === false ? "Pendiente" : moment(this.state.xml[i].signature_employee_datetime.split("T")[0]).format("DD/MM/YYYY")+" "+this.state.xml[i].signature_employee_datetime.split("T")[1].split(".")[0],
                    firmadir: this.state.xml[i].signature_director === false ? "Pendiente" : moment(this.state.xml[i].signature_director_datetime.split("T")[0]).format("DD/MM/YYYY")+" "+this.state.xml[i].signature_director_datetime.split("T")[1].split(".")[0],
                    firma_empleado: this.state.xml[i].signature_employee === false ? "Firma Empleado: Pendiente" : "Firma Empleado: "+moment(this.state.xml[i].signature_employee_datetime.split("T")[0]).format("DD/MM/YYYY")+" "+this.state.xml[i].signature_employee_datetime.split("T")[1].split(".")[0],
                    firma_director: this.state.xml[i].signature_director === false ? "Firma Director: Pendiente" : "Firma Director: "+moment(this.state.xml[i].signature_director_datetime.split("T")[0]).format("DD/MM/YYYY")+" "+this.state.xml[i].signature_director_datetime.split("T")[1].split(".")[0],
                    envio: this.state.xml[i].envio_mtess === true ? moment(this.state.xml[i].envio_mtess_date.split("T")[0]).format("DD/MM/YYYY")+" "+this.state.xml[i].envio_mtess_date.split("T")[1].split(".")[0] : "Pendiente",
            }
            data.push(rows)
        }

        const paginationComponentOptions = {
            rowsPerPageText: 'Filas por página',
            rangeSeparatorText: 'de',
            selectAllRowsItem: true,
            selectAllRowsItemText: 'Todos',
        };


        /*const ExpandableRowComponent: React.FC<Props> = ({ data }) => {

            return (
                <>
                    <h4>{data.firma_empleado}</h4>
                    <h4>{data.firma_director}</h4>
                    <h4>{data.envio}</h4>
                </>
            );
        };*/

        return (
                <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    dense
                    paginationComponentOptions={paginationComponentOptions}
                    //expandableRows
                    //expandableRowsComponent={ExpandableRowComponent}
                />
        )
    }
}