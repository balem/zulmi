import { TextFieldFormsy } from "@fuse";
import { Typography, Grid, Paper, IconButton, Button } from "@material-ui/core";
import Formsy from "formsy-react";
import Icon from "@material-ui/core/Icon";
import React, { useRef, useState } from "react";
import ReactTable from "react-table";
import ReactDOM from 'react-dom';
import "./RequestRRHH.css";
import moment from "moment";
import Widget from "../widgets/Widget";
import {FuseAnimateGroup} from '@fuse';
import { useDispatch } from "react-redux";
import { mockEmployees } from '../document-form/MockData'
import DocumentsService from '../../services/DocumentsService'
import { withSwalInstance } from 'sweetalert2-react';
import Swal from 'sweetalert2';

export default function RequestRRHH() {
    const dispatchMsg = useDispatch();
    const SweetAlert = withSwalInstance(Swal);

    function getDocumentsWithUser() {
        return DocumentsService.getDocuments()
            .map(document => {
                const employee = mockEmployees.find(employee => document.userId === employee.id)
                document.ci = employee.ci
                document.nombre = employee.name
                return document
            })
    }
    
    const [requestRRHH, handleRequestRRHH] = useState();
    const [list, handleList] = useState(getDocumentsWithUser());
    
    function showModal(id){
        Swal.fire({
            title: 'Rechazar solicitud',
            customClass: 'swal-wide',
            input: 'textarea',
            inputPlaceholder: 'Ingrese un motivo del rechazo',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.value) {
                const document = DocumentsService.getDocument(id)
                document.motivoRechazo = result.value
                document.status = 'Rechazado'
                DocumentsService.updateDocument(id, document)
                Swal.fire({
                    title: `La solicitud fue rechazada`
                })
                handleList(getDocumentsWithUser())
            }
          })
    }

    function showObservacion(observacion){
        Swal.fire(
            'Observaciones de la solicitud',
            observacion,
            'info'
        )
    }

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
                            <Widget value={DocumentsService.getDocumentsByStatus('Pendiente').length} color='blue' label='PENDIENTES' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatus('Aprobado').length} color='green' label='APROBADOS' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatus('Rechazado').length} color='red' label='RECHAZADOS' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatus('Expirado').length} color='yellow' label='EXPIRADOS' />
                        </div>
                        <div className="flex sm:w-1/5 md:w-1/5 p-12">
                            <Widget value={DocumentsService.getDocumentsByStatus('Anulado').length} color='gray' label='ANULADOS' />
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
                                        Header: "Tipo de solicitud",
                                        accessor: "type"
                                    },
                                    {
                                        Header: "Fecha Desde",
                                        accessor: "desde"
                                    },
                                    {
                                        Header: "Fecha Hasta",
                                        accessor: "hasta"
                                    },
                                     
                                    {
                                        Header: "Observación de Rechazo",
                                        Cell: row =>
                                        <div className="flex items-center">
                                            { row.original.motivoRechazo ?
                                                <IconButton title="Ver Observación"
                                                    onClick={ e => showObservacion(row.original.motivoRechazo) }
                                                >
                                                    <Icon>info</Icon>
                                                </IconButton> :
                                                <i>Sin observaciones</i>
                                            }
                                        </div>
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
                                                
                                                <IconButton title="Aprobar"
                                                href={`/form/${row.original.type}/${row.original.id}`}
                                                disabled={row.original.status != 'Pendiente'}
                                                // onClick={(ev) => {
                                                //     ev.stopPropagation();
                                                //     dispatch(Actions.removeContact(row.original.id));
                                                // }}
                                                >
                                                    <Icon>thumb_up</Icon>
                                                </IconButton>
                                                <IconButton title="Rechazar"
                                                disabled={row.original.status != 'Pendiente'}
                                                onClick={ e => showModal(row.original.id) }
                                                >
                                                    <Icon>thumb_down</Icon>
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


