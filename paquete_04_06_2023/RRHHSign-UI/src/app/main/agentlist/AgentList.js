import { TextFieldFormsy } from "@fuse";
import { Typography, Grid, Paper, IconButton, Button } from "@material-ui/core";
import Formsy from "formsy-react";
import Icon from "@material-ui/core/Icon";
import React, { useRef, useState, useEffect } from "react";
import ReactTable from "react-table";
import "./AgentList.css";
import AgentService from "./../../services/AgentService/index";
import moment from "moment";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import esLocale from "date-fns/locale/es";
import momentESLocale from "moment/locale/es";
import Moment from "moment";
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";

function AgentList() {
    const dispatchMsg = useDispatch();

    const [agentsList, handleAgentsList] = useState();
    const [agentId, handleAgentId] = useState();
    const [agentName, handleAgentName] = useState();
    const [agentIdentification, handleAgentIdentification] = useState();
    const [agentRecordStartDate, handleAgentRecordStartDate] = useState(
        moment("2019-01-01")
    );
    const [agentRecordEndDate, handleAgentRecordEndDate] = useState(moment());
    const [agentBirthdayStartDate, handleAgentBirthdayStartDate] = useState(
        moment("1983-01-01")
    );
    const [agentBirthdayEndDate, handleAgentBirthdayEndDate] = useState(
        moment()
    );

    const formRef = useRef(null);

    function message(type = "null", message = "") {
        dispatchMsg(
            Actions.showMessage({
                message: message,
                autoHideDuration: 6000, //ms
                anchorOrigin: {
                    vertical: "top", //top bottom
                    horizontal: "center" //left center right
                },
                variant: type //success error info warning null
            })
        );
    }

    useEffect(() => {   
        filter()
    }, [agentsList]);

    async function filter() {
        let filter = {
            id: agentId,
            name: agentName,
            identification: agentIdentification,
            record_start_date: agentRecordStartDate,
            record_end_date: agentRecordEndDate,
            birthday_start_date: agentBirthdayStartDate,
            birthday_end_date: agentBirthdayEndDate
        };

        let agents = await AgentService.getAgents(filter);
        if (agents.status !== 200) {
            message("error", agents.data);
            handleAgentsList([]);
        } else {
            handleAgentsList(agents.data.data);
        }
    }

    async function remove(id) {
        let agentData = {
            id: id
        };

        let response = await AgentService.delAgent(agentData);
        message(response.data.status, response.data.data);
        filter();
    }

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Lista de Agentes de Registro
                </Typography>
                <Formsy ref={formRef} className="flex flex-col justify-center">
                    <Paper className="p-12">
                        <Typography className="h4 mb-24">Filtros</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6} className="alignRight">
                                <TextFieldFormsy
                                    className="mb-16"
                                    type="text"
                                    name="name"
                                    label="Nombre"
                                    validations={{
                                        minLength: 4
                                    }}
                                    validationErrors={{
                                        minLength:
                                            "La longitud mínima del carácter es 4"
                                    }}
                                    fullWidth
                                />
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <DatePicker
                                        className="mt-16"
                                        value={agentBirthdayStartDate}
                                        onChange={handleAgentBirthdayStartDate}
                                        label="Fecha de nacimiento inicial"
                                        openTo="year"
                                        format="dd/MM/yyyy"
                                        views={["year", "month", "date"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <DatePicker
                                        className="mt-16"
                                        value={agentRecordStartDate}
                                        onChange={handleAgentRecordStartDate}
                                        label="Fecha de cadastro inicial"
                                        openTo="year"
                                        format="dd/MM/yyyy"
                                        views={["year", "month", "date"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} md={6} className="alignRight">
                                <TextFieldFormsy
                                    className="mb-16"
                                    type="text"
                                    name="ci"
                                    label="CI"
                                    validations={{
                                        minLength: 9,
                                        isNumeric: "isNumeric"
                                    }}
                                    validationErrors={{
                                        minLength:
                                            "La longitud mínima del carácter es 9",
                                        isNumeric: "Solo se permiten números"
                                    }}
                                    fullWidth
                                />
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <DatePicker
                                        className="mt-16"
                                        value={agentBirthdayEndDate}
                                        onChange={handleAgentBirthdayEndDate}
                                        label="Fecha de nacimiento final"
                                        openTo="year"
                                        format="dd/MM/yyyy"
                                        views={["year", "month", "date"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <DatePicker
                                        className="mt-16"
                                        value={agentRecordEndDate}
                                        onChange={handleAgentRecordEndDate}
                                        label="Fecha de cadastro final"
                                        openTo="year"
                                        format="dd/MM/yyyy"
                                        views={["year", "month", "date"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} md={6} className="alignCenter">
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={filter}
                                >
                                    Filtrar
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Formsy>

                <Paper className="p-12 mt-16">
                    <Typography className="h2 mb-24">Resultados</Typography>
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
                                data={agentsList}
                                onLoad={filter}
                                columns={[
                                    {
                                        Header: "CI",
                                        accessor: "identification",
                                        width: 120
                                    },
                                    {
                                        Header: "Nombre",
                                        accessor: "name",
                                        width: 350
                                    },
                                    {
                                        Header: "E-mail",
                                        accessor: "email",
                                        width: 250
                                    },
                                    {
                                        Header: "Sexo",
                                        accessor: "sex",
                                        width: 100
                                    },
                                    {
                                        Header: "Nascimiento",
                                        id: "birthday",
                                        accessor: d => {
                                            return Moment(d.birthday)
                                                .local(momentESLocale)
                                                .format("DD-MM-YYYY");
                                        },
                                        width: 130
                                    },
                                    {
                                        Header: "Cadastro",
                                        id: "created_at",
                                        accessor: d => {
                                            return Moment(d.updated_at)
                                                .local(momentESLocale)
                                                .format("DD-MM-YYYY");
                                        },
                                        width: 130
                                    },
                                    {
                                        Header: "Acción",
                                        width: 100,
                                        Cell: row =>
                                            <div className="flex items-center">
                                                <IconButton href={`/user-register/${row.original.id}`}>
                                                    <Icon>edit</Icon>
                                                </IconButton>
                                                <IconButton
                                                    onClick={ev => {
                                                        ev.stopPropagation();
                                                        //dispatch(Actions.removeContact(row.original.id));
                                                        remove(row.original.id);
                                                    }}
                                                >
                                                    <Icon>delete</Icon>
                                                </IconButton>
                                            </div>
                                    }
                                ]}
                                defaultPageSize={20}
                                className="-striped -highlight"
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div>
    );
}

export default AgentList;
