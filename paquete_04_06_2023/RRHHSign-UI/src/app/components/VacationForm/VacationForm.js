import {
    MenuItem,
    Typography,
    Grid,
    //Avatar,
    Paper,
    Icon,
    Fab
} from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import esLocale from "date-fns/locale/es";
import Formsy, { addValidationRule } from "formsy-react";
import React, { useRef, useState, useEffect } from "react";
import { SelectFormsy, TextFieldFormsy } from "@fuse";
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";

export default function VacationForm(props) {
    const { mockEmployees } = props.mockData
    const saveDocument = props.saveDocument

    const document = props.document
    const employee = mockEmployees.find(e => e.id == document.userId)
    
    const dispatchMsg = useDispatch();

    const formRef = useRef(null);

    const now = new Date()

    const fromDateParts = document.desde.split('/')
    const fromDate = new Date(fromDateParts[2],fromDateParts[1],fromDateParts[0])

    const toDateParts = document.hasta.split('/')
    const toDate = new Date(toDateParts[2],toDateParts[1],toDateParts[0])

    const dias = getNumWorkDays(fromDate, toDate)
    const salarioDiario = calculateSalarioDiario(employee.salario)
    
    const [empleados, handleEmpleados] = useState(mockEmployees)
    const [selectedEmpleado, handleEmpleadosChange] = useState(props.id)
    const [ciEmpleado, handleCiEmpleado] = useState(employee.ci)
    const [nombreEmpleado, handleNombreEmpleado] = useState(employee.name)
    const [neto, handleNeto] = useState(Math.floor(salarioDiario * dias))
    const [salario, handleSalario] = useState(employee.salario)
    const [selectedHiredDate, handleHiredDateChange] = useState(employee.hireDate)
    const [diasVacaciones, handleDiasVacaciones] = useState(dias)
    
    const [selectedFromDate, handleFromDateChange] = useState(fromDate)
    
    const [selectedToDate, handleToDateChange] = useState(toDate)
    const [antiguedad, handleAntiguedad] = useState(calculateWorkingYears(employee.hireDate, now))
    const [observacion, handleObservacion] = useState(document.observacion)

    const [isFormValid, setIsFormValid] = useState(false)
    const [isFormSaved, setIsFormSaved] = useState(false)
    const [id, handleId] = useState(null);

    function changeEmpleadoData(id) {
        // handleCiEmpleado(empleados[id].ci)
        // handleNombreEmpleado(empleados[id].name)
        // handleHiredDateChange(empleados[id].hireDate)
        // handleAntiguedad(calculateWorkingYears(empleados[id].hireDate, now))
        // handleSalario(empleados[id].salario)
        // handleFromDateChange(empleados[id].fromDate)
        // handleToDateChange(empleados[id].toDate)
    }

    useEffect(
        () => calculateNeto(),
        [selectedFromDate, selectedToDate, salario]
    )

    useEffect(
        () => changeEmpleadoData(selectedEmpleado),
        [selectedEmpleado]
    )

    const { state, dispatch } = React.useContext(Store);

    var icon = "save";

    function calculateNeto() {
        // const dias = getNumWorkDays(selectedFromDate, selectedToDate)
        // handleDiasVacaciones(dias)
        // const salarioDiario = calculateSalarioDiario(salario)
        // handleNeto(Math.floor(salarioDiario * dias))
    }

    function calculateSalarioDiario(salario) {
        return salario / 30
    }

    function calculateWorkingYears(dateOne, dateTwo) {
        let difference = dateTwo.getFullYear() - dateOne.getFullYear()
        if (dateTwo.getMonth() <= dateOne.getMonth() && dateTwo.getDate() > dateOne.getDate()) {
            difference--
        }
        return difference.toString()
    }

    function getNumWorkDays(startDate, endDate) {
        let numWorkDays = 0
        let currentDate = new Date(startDate)
        
        while (currentDate <= endDate) {
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                numWorkDays++
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }
        return numWorkDays + 1
    }

    //MAIN FORM
    function disableButton() {
        setIsFormValid(false);
    }

    function enableButton() {
        setIsFormValid(true);
    }

    function save() {
        document.observacion = observacion
        document.status = 'Aprobado'
        document.desde = getDateAsDdMmYyyy(selectedFromDate)
        document.hasta = getDateAsDdMmYyyy(selectedToDate)
        document.neto = neto
        saveDocument(props.id, document)
        message('success', 'Solicitud aceptada exitosamente!')
    }

    function getDateAsDdMmYyyy(date) {
        return `${appendZero(date.getDate())}/${appendZero(date.getMonth() + 1)}/${date.getFullYear()}`
    }

    function appendZero(num) {
        return num < 10 ? `0${num}` : num
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
        <div>
            <Formsy
                onValid={enableButton}
                onInvalid={disableButton}
                ref={formRef}
                className="flex flex-col justify-center"
            >
                <Paper className="p-12" md={12}>
                    <Typography className="h4 mb-24">
                        Datos del permiso de vacaciones
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="name"
                                label="Nombre del Empleado"
                                fullWidth
                                required
                                disabled
                                value={nombreEmpleado}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="ci"
                                label="Número de C.I. del Empleado"
                                fullWidth
                                required
                                disabled
                                value={ciEmpleado}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <DatePicker
                                    className="mt-16"
                                    value={selectedHiredDate}
                                    onChange={handleHiredDateChange}
                                    label="Fecha de contratación"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                    disabled
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="antiguedad"
                                label="Antigüedad (en años) del Empleado"
                                fullWidth
                                required
                                disabled
                                value={antiguedad}
                            />
                        </Grid>
                    </Grid>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <DatePicker
                                    className="mt-16"
                                    value={selectedFromDate}
                                    onChange={handleFromDateChange}
                                    label="Fecha de inicio"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <DatePicker
                                    className="mt-16"
                                    value={selectedToDate}
                                    onChange={handleToDateChange}
                                    label="Fecha fin"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="diasVacaciones"
                                label="Cantidad de días"
                                fullWidth
                                required
                                disabled
                                value={diasVacaciones}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="salario"
                                label="Salario"
                                fullWidth
                                required
                                disabled
                                value={salario}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="netoCobrar"
                                label="Monto neto a cobrar"
                                fullWidth
                                required
                                value={neto}
                                onChange={ e => handleNeto(e.target.value) }
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="observacion"
                                label="Observaciones"
                                fullWidth
                                value={observacion}
                            />
                        </Grid>
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
                    {icon}
                </Icon>
            </Fab>
            {/* {renderIf(isFormSaved)(props.uploadForm)} */}
        </div>
    );
}
