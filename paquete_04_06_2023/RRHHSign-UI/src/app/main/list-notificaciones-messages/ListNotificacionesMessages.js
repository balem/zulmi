import React, { useRef, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Typography, Grid, Paper } from "@material-ui/core";
import Formsy from "formsy-react";
import esLocale from "date-fns/locale/es";
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    DatePicker
} from '@material-ui/pickers';
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import NotificacionListItem from "app/components/NotificacionListItem/index";
import NotificacionesService from 'app/services/NotificacionesService';
import Moment from "moment";
import momentESLocale from "moment/locale/es";

var pfcount=0;

export default function ListNotificacionesMessages(props) {
    const userEmail = useSelector(({auth}) => auth.user.data.email);
    const userRole = useSelector(({auth}) => auth.user.role);
    const [documentId, handleDocumentId] = useState(props.match.params.id);
    const [groupId, handleGroupID] = useState(props.match.params.groupId);
    const dispatchMsg = useDispatch();
    const formRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [notificacionesList, setNotificacionesList] = useState([]);
    
    async function fetchNotificaciones() {
        let groupId = await NotificacionesService.getNotificacionesGetGroup(documentId);
        let filter = {
            group_id: groupId.data.data[0].user_group_id
        }
        if (selectedDate) {
            filter.fecha = Moment(selectedDate).local(momentESLocale).format('YYYY-MM-DD')
        }
        if (userRole.indexOf('funcionario') > -1) {
            filter.user_email = userEmail
        }
        filter.id = documentId;
        const result = await NotificacionesService.getNotificaciones(filter);
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

    useEffect(() => {
        if (documentId) {
            fetchNotificaciones()
        }
    }, [documentId])

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
                    Lista Notificaciones
                </Typography>
                <Paper className="p-12 mt-16">
                    <Typography className="h2 mb-24">Resultados</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            
                                <NotificacionListItem key={notificacionesList.id} registro={notificacionesList} updateFunction={fetchNotificaciones} />
                            
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div>
    );
}