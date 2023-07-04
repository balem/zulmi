import {
    MenuItem,
    Typography,
    Grid,
    //Avatar,
    Paper,
    Icon,
    Fab,
    TextField
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

export default function PermissionForm(props) {
    const {
        mockEmployees,
        mockDepartamentos,
        mockTiposPermiso
     } = props.mockData
    const saveDocument = props.saveDocument

    const document = props.document
    console.log(mockEmployees)
    console.log(document)
    const employee = mockEmployees.find(e => e.id == document.userId)

    const dispatchMsg = useDispatch();

    const formRef = useRef(null);

    const now = new Date()

    const [empleados, handleEmpleados] = useState(mockEmployees)
    const [selectedEmpleado, handleEmpleadosChange] = useState(props.id)
    const [departamento, handleDepartamento] = useState(employee.departamento)
    const [tipo, handleTipo] = useState(document.tipo)
    const [ciEmpleado, handleCiEmpleado] = useState(employee.ci)
    const [nombreEmpleado, handleNombreEmpleado] = useState(employee.name)
    const [diasPermiso, handlediasPermiso] = useState()
    const fromDateParts = document.desde.split('/')
    const [selectedFromDate, handleFromDateChange] = useState(new Date(fromDateParts[2],fromDateParts[1],fromDateParts[0]))
    const toDateParts = document.hasta.split('/')
    const [fromHour, handleFromHour] = useState(document.deHora)
    const [toHour, handleToHour] = useState(document.hastaHora)
    const [selectedToDate, handleToDateChange] = useState(new Date(toDateParts[2],toDateParts[1],toDateParts[0]))
    const [motivo, handleMotivo] = useState(document.motivo)
    
    const [isFormValid, setIsFormValid] = useState(false)
    const [isFormSaved, setIsFormSaved] = useState(false)
    const [id, handleId] = useState(null);

    useEffect(
        () => handlediasPermiso(getNumWorkDays(selectedFromDate, selectedToDate)),
        [selectedFromDate, selectedToDate]
    )

    const { state, dispatch } = React.useContext(Store);

    var icon = "save";

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
        console.log('currentDate', currentDate)
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

    function getDateAsDdMmYyyy(date) {
        return `${appendZero(date.getDate())}/${appendZero(date.getMonth() + 1)}/${date.getFullYear()}`
    }

    function appendZero(num) {
        return num < 10 ? `0${num}` : num
    }

    function save() {
        document.status = 'Aprobado'
        document.desde = getDateAsDdMmYyyy(selectedFromDate)
        document.hasta = getDateAsDdMmYyyy(selectedToDate)
        document.deHora = fromHour
        document.hastaHora = toHour
        saveDocument(props.id, document)
        message('success', 'Solicitud aceptada exitosamente!')
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
                        Datos del permiso de ausencia
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={4}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="selectedDepartamento"
                                label="Departamento del Empleado"
                                fullWidth
                                required
                                disabled
                                value={departamento}
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
                                    disabled
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
                                    disabled
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="diasPermiso"
                                label="Cantidad de días"
                                fullWidth
                                required
                                disabled
                                value={diasPermiso}
                            />
                        </Grid>
                    </Grid>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                className="mb-16"
                                type="text"
                                name="fromHour"
                                label="Hora de inicio"
                                fullWidth
                                type="time"
                                value={fromHour}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="toHour"
                                label="Hora de fin"
                                fullWidth
                                type="time"
                                value={toHour}
                                disabled
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <TextFieldFormsy
                                className="mb-16"
                                type="text"
                                name="motivo"
                                label="Motivo"
                                fullWidth
                                value={motivo}
                                disabled
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} className="tipos-select-container">
                        <Grid item xs={12} md={12}>
                            <label>Tipo de permiso solicitado</label>
                            <p>{ mockTiposPermiso.find(t => t.id === tipo).name }</p>
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
