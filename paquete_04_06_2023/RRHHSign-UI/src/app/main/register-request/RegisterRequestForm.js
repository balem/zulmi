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
import renderIf from "../Utils/renderIf";
import { mockTiposPermiso } from '../document-form/MockData'
import DocumentService from '../../services/DocumentsService'

export default function RegisterRequestForm(props) {
    const dispatchMsg = useDispatch();

    const formRef = useRef(null);

    const now = new Date()

    function toTime(date) {
        return `${appendZero(date.getHours())}:${appendZero(date.getMinutes())}`
    }

    const [diasVacaciones, handleDiasVacaciones] = useState()
    const [selectedFromDate, handleFromDateChange] = useState(new Date())
    const [selectedToDate, handleToDateChange] = useState(new Date())
    const [selectedType, handleTypeChange] = useState('vacations')
    const [fromHour, handleFromHour] = useState(toTime(now))
    const [toHour, handleToHour] = useState(toTime(now))
    const [motivo, handleMotivo] = useState()
    const [tipo, handleTipo] = useState()

    const [isFormValid, setIsFormValid] = useState(false)
    const [isFormSaved, setIsFormSaved] = useState(false)
    const [id, handleId] = useState(null);

    useEffect(
        () => handleDiasVacaciones(getNumWorkDays(selectedFromDate, selectedToDate)),
        [selectedFromDate, selectedToDate]
    )

    const { state, dispatch } = React.useContext(Store);

    var icon = "save";

    //MAIN FORM
    function disableButton() {
        setIsFormValid(false);
    }

    function enableButton() {
        setIsFormValid(true);
    }

    function save() {
        DocumentService.addDocument({
            desde: getDateAsDdMmYyyy(selectedFromDate),
            hasta: getDateAsDdMmYyyy(selectedToDate),
            deHora: fromHour,
            hastaHora: toHour,
            motivo: motivo,
            type: selectedType,
            tipo: tipo,
            status: "Pendiente"
        })
        
        message('success', 'Solicitud registrada exitosamente!')
    }

    function getDateAsDdMmYyyy(date) {
        return `${appendZero(date.getDate())}/${appendZero(date.getMonth() + 1)}/${date.getFullYear()}`
    }

    function appendZero(num) {
        return num < 10 ? `0${num}` : num
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
        return numWorkDays.toString()
    }

    function isPermission() {
        return selectedType === 'permission'
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
                        Datos de la solicitud
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <SelectFormsy 
                                className="mt-16 fullWidthSelect" 
                                name="request_type" 
                                label="Tipo de solicitud" 
                                value={selectedType}
                                validationError="Seleccione uno" 
                                onChange={e => handleTypeChange(e.target.value)} 
                                required
                            >
                                <MenuItem value="vacations">
                                    <em>Vacaciones</em>
                                </MenuItem>
                                <MenuItem value="permission">
                                    <em>Permiso</em>
                                </MenuItem>
                            </SelectFormsy>
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
                    {renderIf(isPermission())(
                        <div>
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
                                        onChange={ e => handleFromHour(e.target.value) }
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
                                        onChange={ e => handleToHour(e.target.value) }
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
                                        required
                                        value={motivo}
                                        onChange={e => handleMotivo(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3} className="tipos-select-container">
                                <Grid item xs={12} md={12}>
                                    <SelectFormsy 
                                        className="mt-16 fullWidthSelect" 
                                        name="request_type" 
                                        label="Tipo de permiso solicitado" 
                                        value={tipo}
                                        validationError="Seleccione uno" 
                                        onChange={e => handleTipo(e.target.value)} 
                                        required
                                    >
                                        {mockTiposPermiso.map(tipo =>
                                            <MenuItem value={tipo.id}>
                                                <em>{ tipo.name }</em>
                                            </MenuItem>
                                        )}
                                    </SelectFormsy>
                                </Grid>
                            </Grid>
                        </div>
                    )}
                </Paper>
            </Formsy>
            <Fab
                href={`/RequestList`}
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
