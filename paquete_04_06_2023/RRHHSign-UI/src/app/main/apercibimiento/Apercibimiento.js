import React, { useRef, useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { Typography, Grid, Paper } from "@material-ui/core";
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
import ApercibimientosService from 'app/services/ApercibimientosService';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import EmployeeService from 'app/services/EmployeeService';

export default function Apercibimiento() {
    const dispatchMsg = useDispatch();

    const formRef = useRef(null);
    
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEmployee, setSelectedEmployee] = useState();
    const [motivo, handleMotivo] = useState('');
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
            const result = await ApercibimientosService.saveApercibimiento(
                selectedEmployee,
                selectedDate,
                motivo
            )
            if (result.data.status == 'success') {
                message("success", "Documento insertado exitósamente")
            } else {
                message("error", "Error al insertar el documento")
            }
        } catch (e) {
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
                    Apercibimiento
                </Typography>
                <Formsy
                    onValid={enableButton}
                    onInvalid={disableButton}
                    ref={formRef}
                    className="flex flex-col justify-center"
                >
                    <Paper className="p-24">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha Apercibimiento"
                                        value={selectedDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedDate}
                                        fullWidth
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Motivo Apercibimiento"
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