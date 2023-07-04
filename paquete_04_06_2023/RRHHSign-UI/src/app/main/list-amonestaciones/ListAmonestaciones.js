import React, { useRef, useState } from 'react';
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
import AmonestacionListItem from "app/components/AmonestacionListItem/index";
import AmonestacionesService from 'app/services/AmonestacionesService';
import Moment from "moment";
import momentESLocale from "moment/locale/es";

var pfcount=0;

export default function ListAmonestaciones() {
    const userEmail = useSelector(({auth}) => auth.user.data.email);
    const userRole = useSelector(({auth}) => auth.user.role);

    console.log(userEmail)

    const dispatchMsg = useDispatch();
    const formRef = useRef(null);

    const [selectedDate, setSelectedDate] = useState(null);
    const [amonestacionList, setAmonestacionList] = useState([]);

    async function fetchAmonestaciones() {
        let filter = {}
        if (selectedDate) {
            filter.fecha = Moment(selectedDate).local(momentESLocale).format('YYYY-MM-DD')
        }
        if (userRole.indexOf('funcionario') > -1) {
            filter.user_email = userEmail
        }
        const result = await AmonestacionesService.getAmonestaciones(filter);
        if (result.status === 200) {
            if (result.data.status === "success") {
                setAmonestacionList(result.data.data);
            } else if (result.data.status === "error") {
                setAmonestacionList([]);
                message("error", result.data.data);
            } else {
                setAmonestacionList([]);
            }
        } else {
            setAmonestacionList([]);
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
                    Lista Amonestaciónes
                </Typography>
                <Formsy ref={formRef} className="flex flex-col justify-center">
                    <Paper className="p-24">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha Amonestación"
                                        value={selectedDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedDate}
                                        placeholder="Seleccione una fecha"
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
                                    onClick={fetchAmonestaciones}
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
                </Formsy>
                <Paper className="p-12 mt-16">
                    <Typography className="h2 mb-24">Resultados</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            {amonestacionList.map(amonestacion =>
                                <AmonestacionListItem key={amonestacion.id} registro={amonestacion} updateFunction={fetchAmonestaciones} />
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div>
    );
}