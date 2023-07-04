import {
    MenuItem,
    Typography,
    Grid,
    Paper,
    Icon,
    IconButton,
    Button
} from "@material-ui/core";
import React, { useRef, useState, useEffect } from "react";
import ReactTable from "react-table";
import { SelectFormsy, TextFieldFormsy } from "@fuse";
import Formsy from "formsy-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";
import EmployeeService from "app/services/EmployeeService";
import EmployeeListItem from "app/components/EmployeeListItem";
import UploadEmployees from "../UploadEmployees";
import LogsService from "app/services/LogsService";
import LogsListItem from "../LogsListItem";

import { KeyboardDatePicker, DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import esLocale from "date-fns/locale/es";
import moment from 'moment';

var pfcount = 0;

export default function LogsList(props) {
    const dispatchMsg = useDispatch();

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;

    const { state, dispatch } = React.useContext(Store);

    const [isFormValid, setIsFormValid] = useState(false);
    const [logs, handleLogs] = useState([]);
    const [employees, handleEmployees] = useState([])
    const [employee, handleEmployee] = useState('ALL')
    const [tipolog, handleTipolog] = useState('NORMAL')
    const [startDate, handleStartDateChange] = useState(state.start_pay_date);
    const [endDate, handleEndDateChange] = useState(state.end_pay_date);
    const [fecha, handleFecha] = useState([]);

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

    //carrega os empregados
    const fetchLogs = async () => {
        let query = {}
        if (employee != 'ALL') {
            query.userId = employee
        }
        if (startDate) {
            query.dateFrom = startDate
        }
        if (endDate) {
            query.dateTo = endDate
        }

        if (tipolog) {
            query.tipolog = tipolog
        }
        const result = await LogsService.getLogs(query);
        if ((result) && (result.status === 200)) {
            if (result.data.status === "success") { 
                let datos = [];
                for (var i = 0; i < result.data.data.length; i++) {
                    var created_at_hora = result.data.data[i].created_at.split("T")[1];
                    var fecha  = result.data.data[i].created_at.split("T")[0];
                    var hora = created_at_hora.split(".")[0];

                    datos.push({
                        id: result.data.data[i].id,
                        name: result.data.data[i].name,
                        message: result.data.data[i].message,
                        recibo: result.data.data[i].recibo,
                        created_at: moment(fecha).format("DD-MM-YYYY")+" "+hora
                    })
                }
                handleLogs(datos);
            } else if (result.data.status === "error") {
                handleLogs([]);
                message("error", result.data.data);
            } else {
                message("warning", result.data.data);
            }
        } else {
            handleLogs([]);
        }
    }

    function downloadEmployeesProblem() {
        window.location.href = `${process.env.REACT_APP_API_HOST}/logs/problem-employees-excel?fecha=${startDate}`
    }

    //carrega os empregados
    const fetchEmployees = async () => {
        const result = await EmployeeService.getEmployees({
            userEmail
        });
        if (result.status === 200) {
            if (result.data.status === "success") {
                handleEmployees(result.data.data);
            } else if (result.data.status === "error") {
                handleEmployees([]);
                message("error", result.data.data);
            } else {
                message("warning", result.data.data);
            }
        } else {
            handleEmployees([]);
        }
    }

    useEffect(() => {
        fetchEmployees();
        fetchLogs();
    }, [state]);

    return (
        <div>
            <Formsy //onValidSubmit={handleSubmit}
                //onValid={enableButton}
                //onInvalid={disableButton}
                //ref={formRef}
                className="flex flex-col justify-center">
                <Paper className="p-12">
                    <Typography className="h4 mb-24">Filtros</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <SelectFormsy
                                className="mb-16 fullWidthSelect"
                                name="status"
                                label="Usuario"
                                onChange={e => handleEmployee(e.target.value)}
                                //validations="isNotEqualToNone"
                                validationError="Seleccione un Empleado"
                                required
                            >
                                <MenuItem key={0} value='ALL'>Todos los empleados</MenuItem>
                                {employees.map(employee =>
                                    <MenuItem key={employee.id} value={employee.user_id}>{employee.nombres + ' ' + employee.apellidos}</MenuItem>
                                )}
                            </SelectFormsy>
                            
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <SelectFormsy
                                className="mb-16 fullWidthSelect"
                                name="tipolog"
                                label="Tipo Log"
                                onChange={e => handleTipolog(e.target.value)}
                                //validations="isNotEqualToNone"
                                validationError="Seleccione tipo log"
                                required
                            >
                                <MenuItem key={0} value='NORMAL'>TODOS</MenuItem>
                                <MenuItem key={1} value='EMPLEADOS'>CARGA EMPLEADOS</MenuItem>
                                <MenuItem key={2} value='CARGA'>CARGA RECIBO</MenuItem>
                                <MenuItem key={3} value='FIRMA'>FIRMA DE DOCUMENTO</MenuItem>
                            </SelectFormsy>
                            
                        </Grid>
                        <Grid item xs={12} md={6} className="alignRight">
                        <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <KeyboardDatePicker
                                    className="mb-16"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    label="Fecha Inicial"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} md={6} className="alignRight">
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <KeyboardDatePicker
                                    className="mb-16"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    label="Fecha Final"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                         
                        <Grid item xs={12} className="alignRight">
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                className="mx-auto mt-32"
                                aria-label="Filtrar"
                            onClick={fetchLogs}
                            //disabled={!isContactsFormValid}
                            >
                                Filtrar
                            </Button>
                           
                            <Grid item xs={6}>
                            {tipolog != "EMPLEADOS" ? <Grid /> : 
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={downloadEmployeesProblem}
                                    //disabled={!isContactsFormValid}
                                >
                                    Descargar Lista de Empleados
                                </Button>
                                }
                            </Grid>
                        
                        </Grid>
                        
                    </Grid>
                </Paper>
            </Formsy>
            <Paper className="p-12 mt-16">
                {/* <Typography className="h4 mb-24">Log de acciones</Typography> */}
                {/* <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="nombres"
                            label="Nombres"
                            value={employeeNombres}
                            validations={{
                                minLength: 4
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud mínima del carácter es 4"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeNombres(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="apellidos"
                            label="Apellidos"
                            value={employeeApellidos}
                            validations={{
                                minLength: 4
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud mínima del carácter es 4"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeApellidos(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="email"
                            label="Correo Electronico"
                            value={employeeEmail}
                            validations="isEmail"
                            validationError="Este no es un correo electrónico válido"
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="identification"
                            label="Cedula de Identidad"
                            value={employeeIdentification}
                            validations={{
                                maxLength: 20
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud máxima del carácter es 20"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeIdentification(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="sueldo"
                            value={employeeSueldo}
                            label="Sueldo/Jornal"
                            fullWidth
                            required
                            onChange={e =>
                                handleLogsueldo(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="ips_empleado"
                            value={employeeIps}
                            label="IPS Empleado"
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeIps(e.target.value)}
                        />
                    </Grid>
                </Grid> */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        {logs.map(log => {
                            var reg = {
                                id: log.id,
                                nombres: log.name,
                                message: log.message,
                                recibo: log.recibo,
                                created_at: log.created_at,
                            }
                            return (
                                <LogsListItem
                                    key={pfcount++}
                                    registro={reg}
                                />
                            );
                        })}
                        {/* <ReactTable
                            data={employees}
                            onLoad={handleLogs}
                            columns={[
                                {
                                    Header: "Nombres",
                                    accessor: "nombres"
                                },
                                {
                                    Header: "Apellidos",
                                    accessor: "apellidos"
                                },
                                {
                                    Header: "Correo Electronico",
                                    accessor: "email"
                                },
                                {
                                    Header: "Cedula de Identidad",
                                    accessor: "identification"
                                },
                                {
                                    Header: "IPS Empleado",
                                    accessor: "ips_empleado"
                                },
                                // {
                                //     Header: "",
                                //     width: 128,
                                //     Cell: row =>
                                //         <div className="flex items-center">
                                //             <IconButton
                                //                 onClick={(ev) => {
                                //                     ev.stopPropagation();
                                //                     remove(row.original.id);
                                //                 }}
                                //             >
                                //                 <Icon>delete</Icon>
                                //             </IconButton>
                                //         </div>
                                // }
                            ]}
                            defaultPageSize={10}
                            className="-striped -highlight"
                        /> */}
                    </Grid>
                </Grid>
            </Paper>
        </div>
    );
}
