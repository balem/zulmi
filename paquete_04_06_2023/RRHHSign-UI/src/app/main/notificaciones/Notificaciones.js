import React, { useRef, useState, useEffect } from 'react';
import { Typography, Grid, Paper, Checkbox, FormControlLabel } from "@material-ui/core";
import { MenuItem, Icon, Fab } from "@material-ui/core";
import Formsy from "formsy-react";
import esLocale from "date-fns/locale/es";
import { KeyboardDatePicker, MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import TextField from '@material-ui/core/TextField';
import { SelectFormsy } from "@fuse";
import NotificacionesService from 'app/services/NotificacionesService';
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import EmployeeService from 'app/services/EmployeeService';
import UserGroupService from 'app/services/UserGroupService';
import Moment from "moment";
import momentESLocale from "moment/locale/es";
import NotificacionPDF from 'app/components/NotificationPDF/NotificacionPDF';
//import { Store } from "app/react-store/Store";

export default function Notificaciones() {
    const dispatchMsg = useDispatch();

    const formRef = useRef(null);
    //let state = {};
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [titulo, handleTitulo] = useState('');
    const [texto, handleTexto] = useState('');
    const [isFormValid, setIsFormValid] = useState(true)
    const [employees, handleEmployees] = useState([])
    const [groups, handleGroups] = useState([]);
    const [userGroup, handleUserGroup] = useState();
    const [notificationType, handleNotificationType] = useState(1);
    //const {state, dispatch} = React.createContext(Store);
    const [state, dispatch] = useState({ "titulo": "", "texto": "", "userGroup": "", "notificationType": "", "selectedStartDate": "" });
    const userEmail = useSelector(({ auth }) => auth.user.data.email);

    useEffect(() => {
        fetchGroups()
    }, [])

    useEffect(() => {
        dispatch({
            "titulo": titulo, 
            "texto": texto, 
            "userGroup": userGroup, 
            "notificationType": notificationType, 
            "selectedStartDate": selectedStartDate,
            "creator": userEmail
        }); 
        //state.tituo = titulo;
    }, [titulo]);

    useEffect(() => {
        dispatch({
            "titulo": titulo, 
            "texto": texto, 
            "userGroup": userGroup, 
            "notificationType": notificationType, 
            "selectedStartDate": selectedStartDate,
            "creator": userEmail
        }); 
    }, [texto]);

    useEffect(() => {
        dispatch({
            "titulo": titulo, 
            "texto": texto, 
            "userGroup": userGroup, 
            "notificationType": notificationType, 
            "selectedStartDate": selectedStartDate,
            "creator": userEmail
        }); 
    }, [userGroup]);

    useEffect(() => {
        dispatch({
            "titulo": titulo, 
            "texto": texto, 
            "userGroup": userGroup, 
            "notificationType": notificationType, 
            "selectedStartDate": selectedStartDate,
            "creator": userEmail
        }); 
    }, [notificationType]);

    useEffect(() => {
        dispatch({
            "titulo": titulo, 
            "texto": texto, 
            "userGroup": userGroup, 
            "notificationType": notificationType, 
            "selectedStartDate": selectedStartDate,
            "creator": userEmail
        }); 
    }, [selectedStartDate]);

    const fetchGroups = async () => {
        const result = await UserGroupService.getGroups(userEmail);

        if (result) {
            if (result.status === 200) {
                if (result.data.status === "success") {
                    handleGroups(result.data.data.all);
                } else if (result.data.status === "error") {
                    handleGroups([]);
                    message("error", 'Error al recuperar los grupos de la base de datos');
                } else {
                    message("error", 'Error al recuperar los grupos de la base de datos');
                }
            } else {
                handleGroups([]);
            }
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
            const result = await NotificacionesService.saveNotificacion(
                userGroup,
                selectedStartDate,
                titulo,
                texto
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
                    Notificaciones
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
                                    <KeyboardDatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha"
                                        value={selectedStartDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedStartDate}
                                        fullWidth
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <SelectFormsy
                                    className="mt-16 fullWidthSelect"
                                    name="grupos"
                                    label="Tipo de notificación"
                                    value={notificationType}
                                    onChange={e => handleNotificationType(e.target.value)}
                                    required
                                    fullWidth
                                >
                                    <MenuItem value={1}>FIRMA</MenuItem>
                                    <MenuItem value={2}>VISUALIZACION</MenuItem>
                                </SelectFormsy>
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <SelectFormsy
                                    className="mt-16 fullWidthSelect"
                                    name="grupos"
                                    label="Grupos"
                                    value={userGroup}
                                    validationError="Seleccione el grupo al cual enviar la notificación"
                                    onChange={e => handleUserGroup(e.target.value)}
                                    required
                                    fullWidth
                                >
                                    {groups.map(grupo =>
                                        <MenuItem key={grupo.id} value={grupo.id}>{grupo.name}</MenuItem>
                                    )}
                                </SelectFormsy>
                            </Grid>

                            <Grid item xs={12} md={12} >
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Titulo"
                                    //value={values.multiline}
                                    //onChange={handleChange('multiline')}
                                    margin="normal"
                                    value={titulo}
                                    required
                                    onChange={e => handleTitulo(e.target.value)}
                                    fullWidth
                                />
                            </Grid>


                            <Grid item xs={12} md={12} >
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Texto"
                                    multiline
                                    rowsMax="4"
                                    //value={values.multiline}
                                    //onChange={handleChange('multiline')}
                                    margin="normal"
                                    value={texto}
                                    required
                                    onChange={e => handleTexto(e.target.value)}
                                    fullWidth
                                />
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
                        <NotificacionPDF state={state} />
                    </Paper>
                </Formsy>
                {/* <Fab
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
                </Fab> */}
            </div>
        </div>
    );
}