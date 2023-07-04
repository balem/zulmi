import { TextFieldFormsy } from "@fuse";
import { Typography, Grid, Paper, IconButton, Icon, Button, Fab, Link } from "@material-ui/core";
import Formsy from "formsy-react";
import React, { useRef, useState, Component } from "react";
import ReactTable from "react-table";
import "./RequestList.css";
import Widget from "../widgets/Widget";
import {FuseAnimateGroup} from '@fuse';
import { useDispatch } from "react-redux"
import { mockEmployees } from '../document-form/MockData';
import DocumentsService from '../../services/DocumentsService';


export default function RequestList() {
    const dispatchMsg = useDispatch();
    
    const documents = DocumentsService.getDocumentsByUserId(1)
    .map(document => {
        const employee = mockEmployees.find(employee => document.userId === employee.id)
        document.ci = employee.ci
        document.nombre = employee.name
        return document
    })

    const [requestList, handleRequestList] = useState();
    const [list, handleList] = useState(documents);
    
    function getTrProps(state, rowInfo, instance) {
        if (rowInfo) {
            return {
                style: {
                    background:
                        rowInfo.row.status === "Pendiente"
                            ? "#BDC8F8"
                            : rowInfo.row.status === "Aprobado"
                              ? "#BBFABD"
                              : rowInfo.row.status === "Rechazado"
                                ? "#F5B6AD"
                                  : "#ffffff",
                    color: "black"
                }
            };
        }
        return {};
    }
    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Lista de usuarios
                </Typography>
                <Paper className="p-12">
                    <FuseAnimateGroup
                        className="flex flex-wrap"
                        enter={{
                            animation: "transition.slideUpBigIn"
                        }}
                    >
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatusAndUser('Pendiente', 1).length} color='blue' label='PENDIENTES' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatusAndUser('Aprobado', 1).length} color='green' label='APROBADOS' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatusAndUser('Rechazado', 1).length} color='red' label='RECHAZADOS' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatusAndUser('Expirado', 1).length} color='yellow' label='EXPIRADOS' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatusAndUser('Anulado', 1).length} color='gray' label='ANULADOS' />
                        </div>
                    </FuseAnimateGroup>
                </Paper>
                <Formsy className="flex flex-col justify-center">
                    <Paper className="p-12 mt-16">
                        <Typography className="h2 mb-24">Lista de solicitudes</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                            <ReactTable
                                localization={{
                                    pagination: {
                                        labelDisplayedRows:
                                            "{from}-{to} de {count}",
                                        labelRowsPerPage: "filas"
                                    },
                                    toolbar: {
                                        nRowsSelected:
                                            "{0} fila(s) seleccionada(s)"
                                    },
                                    header: {
                                        actions: "Acciones"
                                    },
                                    body: {
                                        emptyDataSourceMessage:
                                            "No hay registros que mostrar",
                                        filterRow: {
                                            filterTooltip: "Filtrar"
                                        }
                                    }
                                }}
                                data={list}
                                onLoad={handleList}
                                columns={[
                                    {
                                        Header: "CI",
                                        accessor: "ci"
                                    },
                                    {
                                        Header: "Nombre y Apellido",
                                        accessor: "nombre"
                                    },
                                    {
                                        Header: "Fecha Desde",
                                        accessor: "desde"
                                    },
                                    {
                                        Header: "Tipo de solicitud",
                                        accessor: "type"
                                    },
                                    {
                                        Header: "Fecha Hasta",
                                        accessor: "hasta"
                                    },
                                     
                                    {
                                        Header: "Observación de Rechazo",
                                        accessor: "observacion"
                                    },
                                    {
                                        Header: "Estado",
                                        accessor: "status"
                                    },
                                    {
                                        Header: "Acción",
                                        width: 128,
                                        Cell: row =>
                                            <div className="flex items-center">
                                               
                                                <IconButton title="Anular"
                                                // onClick={(ev) => {
                                                //     ev.stopPropagation();
                                                //     dispatch(Actions.removeContact(row.original.id));
                                                // }}
                                                >
                                                <Icon>delete</Icon>
                                                </IconButton>
                                                <IconButton title="Modificar"
                                                href={`/form/register`}
                                                disabled={row.original.status != 'Rechazado'}
                                                // onClick={(ev) => {
                                                //     ev.stopPropagation();
                                                //     dispatch(Actions.removeContact(row.original.id));
                                                // }}
                                                >
                                                    <Icon>refresh</Icon>
                                                </IconButton>
                                            </div>
                                    }
                                ]}
                                defaultPageSize={5}
                                className="-striped -highlight"
                                getTrProps={getTrProps}
                            />
                            </Grid>
                        </Grid>
                    </Paper>
                </Formsy>
                
            </div>
        </div>
    );
}


