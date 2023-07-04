import React, { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Typography, Grid, Paper } from "@material-ui/core";
import Formsy from "formsy-react";
import esLocale from "date-fns/locale/es";
import DateFnsUtils from '@date-io/date-fns';
import {
    KeyboardDatePicker,
    MuiPickersUtilsProvider,
    DatePicker
} from '@material-ui/pickers';
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import NotificacionListItem from "app/components/NotificacionListItem/index";
import NotificacionesService from 'app/services/NotificacionesService';
import Moment from "moment";
import momentESLocale from "moment/locale/es";
import { Store } from "app/react-store/Store";

var pfcount=0;

export default function ListNotificaciones() {
    const userEmail = useSelector(({auth}) => auth.user.data.email);
    const userRole = useSelector(({auth}) => auth.user.role);
    const queryParams = new URLSearchParams(window.location.search);
    const groupId = queryParams.get('groupid');
    const title = queryParams.get('title');
    const { state, dispatch } = React.useContext(Store);
    const dispatchMsg = useDispatch();
    const formRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(state.start_pay_date);
    const [titulo, setTitulo] = useState(null);
    const [notificacionesList, setNotificacionesList] = useState([]);
    async function fetchNotificacionesGrupos() {
        let filter = {}
        if (selectedDate) {
            filter.fecha = Moment(selectedDate).local(momentESLocale).format('YYYY-MM-DD')
        }
        if (titulo) {
            filter.titulo = titulo;
        }
        if (userRole.indexOf('funcionario') > -1) {
            filter.user_email = userEmail
        }

        const result = await NotificacionesService.getNotificacionesGrupos(filter);
        if (result.status === 200) {
            if (result.data.status === "success") {
                setNotificacionesList(result.data.data);
            } else if (result.data.status === "error") {
                setNotificacionesList([]);
                message("error", result.data.data);
            } else {
                setNotificacionesList([]);
            }
        } else {
            setNotificacionesList([]);
        }
    }

    function downloadNotificacionSign() {
        window.location.href = process.env.REACT_APP_API_HOST + '/document/notificaciones-excel';
    }

    async function fetchNotificationGroupTitle() {
        let filter = {}
        if (selectedDate) {
            filter.fecha = Moment(selectedDate).local(momentESLocale).format('YYYY-MM-DD')
        }
        if (groupId) {
            filter.groupId = groupId;
        }
        if (title) {
            filter.title = title;
        }
        if (titulo) {
            filter.title = titulo;
        }
        if (userRole.indexOf('funcionario') > -1) {
            filter.user_email = userEmail
        }
        const result = await NotificacionesService.getNotificacionesGetFindGroupTitle(filter);
        if (result.status === 200) {
            if (result.data.status === "success") {
                setNotificacionesList(result.data.data);
            } else if (result.data.status === "error") {
                setNotificacionesList([]);
                message("error", result.data.data);
            } else {
                setNotificacionesList([]);
            }
        } else {
            setNotificacionesList([]);
        }
    }
    function message(type = "null", message = "") {
        dispatchMsg(
            Actions.showMessage({
                message: message,
                autoHideDuration: 6000, //ms
                anchorOrigin: {
                    vertical: "top", //top bottom
                    horizontal: "center" //left ceBnter right
                },
                variant: type //success error info warning null
            })
        );
    }

    useEffect(() => {
        if ((groupId != null) && (title != null)) {
            fetchNotificationGroupTitle();
        }
    }, [])

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Lista Notificaciones
                </Typography>
                <Formsy ref={formRef} className="flex flex-col justify-center">
                    {userRole == 'funcionario' ?
                        <Paper className="p-24">
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={12} >
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                        <KeyboardDatePicker
                                            views={["year", "month", "date"]}
                                            label="Fecha"
                                            value={selectedDate}
                                            format="dd/MM/yyyy"
                                            onChange={setSelectedDate}
                                            fullWidth
                                        />
                                    </MuiPickersUtilsProvider>
                                    <TextField
                                        id="standard-multiline-flexible"
                                        label="Titulo"
                                        multiline
                                        rowsMax="4"
                                        //value={values.multiline}
                                        onChange={event => setTitulo(event.target.value)}
                                        margin="normal"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} className="alignRight">
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        className="mx-auto mt-32"
                                        aria-label="Filtrar"
                                        onClick={fetchNotificacionesGrupos}
                                    //disabled={!isContactsFormValid}
                                    >
                                        Filtrar
                                    </Button>
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
                    :
                        <Paper></Paper>
                    }
                </Formsy>
                <Paper className="p-12 mt-16">
                    <Typography className="h2 mb-24">Resultados</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            {notificacionesList.map(notificacion =>
                                <NotificacionListItem key={notificacion.id} registro={notificacion} updateFunction={fetchNotificacionesGrupos} group={notificacion.user_group_id} />
                            )}
                        </Grid>
                    </Grid> 
                    {/*  */}
                    <Grid item xs={6} md={6}>
                        {userRole[0] === 'rh' ?  
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                className="mx-auto mt-32"
                                aria-label="Filtrar"
                                onClick={downloadNotificacionSign}
                                //disabled={!isContactsFormValid}
                            >
                                Descargar Lista de Notificaciones
                            </Button>
                            :
                            <Grid></Grid>
                        }
                    </Grid>
                </Paper>
            </div>
        </div>
    );
}