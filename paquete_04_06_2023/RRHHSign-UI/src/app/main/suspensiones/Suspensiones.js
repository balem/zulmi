import React, { useRef, useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { Typography, Grid, Paper, Checkbox, FormControlLabel } from "@material-ui/core";
import Formsy from "formsy-react";
import { SelectFormsy } from "@fuse";
import esLocale from "date-fns/locale/es";
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    DatePicker
} from '@material-ui/pickers';
import {
    MenuItem,
    Icon,
    Fab
} from "@material-ui/core";
import SuspensionesService from 'app/services/SuspensionesService';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import EmployeeService from 'app/services/EmployeeService';

export default function Suspensiones() {
    const dispatchMsg = useDispatch();

    const formRef = useRef(null);

    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const [selectedEmployee, setSelectedEmployee] = useState();
    const [motivo, handleMotivo] = useState('');
    const [suspensionJudicial, handleSuspensionJudicial] = useState(false);
    const [isFormValid, setIsFormValid] = useState(true)
    const [employees, handleEmployees] = useState([])

    useEffect(() => {
        fetchEmployees()
    }, [])

    async function fetchEmployees() {
        const result = await EmployeeService.getEmployees();
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

    function disableButton() {
        setIsFormValid(false);
    }

    function enableButton() {
        setIsFormValid(true);
    }

    async function save() {
        try {
            const result = await SuspensionesService.saveSuspension(
                selectedEmployee,
                selectedStartDate,
                selectedEndDate,
                suspensionJudicial,
                motivo
            )
            if (result.data.status == 'success') {
                message("success", "Documento insertado exitósamente")
            } else {
                message("error", "Error al insertar el documento")
            }
        } catch (e) {
            console.log(e)
            message("error", "Error al insertar el documento")
        }
    }

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

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Suspensiones
                </Typography>
                <Formsy
                    onValid={enableButton}
                    onInvalid={disableButton}
                    ref={formRef}
                    className="flex flex-col justify-center"
                >
                    <Paper className="p-24">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha de Inicio"
                                        value={selectedStartDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedStartDate}
                                        fullWidth
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} md={6} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha de Fin"
                                        value={selectedEndDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedEndDate}
                                        fullWidth
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} md={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={suspensionJudicial}
                                        onChange={e => handleSuspensionJudicial(e.target.checked)}
                                    />
                                }
                                label="Es una suspensión judicial"
                                labelPlacement="end"
                            />
                            </Grid>
                            <Grid item xs={12} md={12} >
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Motivo"
                                    multiline
                                    rowsMax="4"
                                    //value={values.multiline}
                                    //onChange={handleChange('multiline')}
                                    margin="normal"
                                    value={motivo}
                                    required
                                    onChange={e => handleMotivo(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <SelectFormsy 
                                    className="mt-16 fullWidthSelect" 
                                    name="employee" 
                                    label="Empleado" 
                                    value={selectedEmployee}
                                    validationError="Seleccione uno" 
                                    onChange={e => setSelectedEmployee(e.target.value)} 
                                    required
                                    fullWidth
                                >
                                    {employees.map((employee) =>
                                        <MenuItem key={employee.id} value={employee.id}>
                                            {employee.name}
                                        </MenuItem>
                                    )}
                                </SelectFormsy>
                            </Grid>
                            {/* <Grid item xs={12} md={6} >
                                     <MuiPickersUtilsProvider className="pt-24" utils={DateFnsUtils}>
                                         <KeyboardTimePicker
                                            margin="normal"
                                            label="Hora"
                                            value={selectedDate}
                                            onChange={setSelectedDate}
                                            fullWidth
                                            />
                                    </MuiPickersUtilsProvider>
                                </Grid> */}
                        </Grid>
                    </Paper>
                </Formsy>
                <Fab
                    className={`fabStyle ${isFormValid
                        ? "fabStyleEnabled"
                        : "fabStyleDisabled"} `}
                    disabled={!isFormValid}
                    onClick={ev => {
                        ev.stopPropagation();
                        save()
                    }}
                >
                    <Icon>
                        save
                    </Icon>
                </Fab>
            </div>
        </div>
    );
}