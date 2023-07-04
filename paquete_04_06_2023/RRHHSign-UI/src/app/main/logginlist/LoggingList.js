import { SelectFormsy, TextFieldFormsy } from '@fuse';
import { MenuItem, Typography, Grid, Paper, Button } from '@material-ui/core';
import Formsy from 'formsy-react';
import React, { useRef, useState, useEffect } from "react";
import "./LoggingList.css";
import LoggingService from 'app/services/LoggingService';
import { Store } from "app/react-store/Store";
import { KeyboardDatePicker, DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import DateFnsUtils from "@date-io/date-fns";
import esLocale from "date-fns/locale/es";
import { useSelector } from "react-redux";

function LoggingList() {
    const formRef = useRef(null);
    const { state, dispatch } = React.useContext(Store);

    const [listLogging, handleListLogging] = useState([]);
    const [identification, handleIdentification] = useState('');
    const [startDate, handleStartDateChange] = useState(startDateVal);
    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;

    let startDateVal = new Date();

    async function queryLogging() {
        let data = {}
        if (identification) {
            data.identification = identification
            data.periodo = moment(startDate).local(momentESLocale).format("MM-YYYY")
        }
        const logging = await LoggingService.getLogging(data, userEmail)

        console.log(logging)
        if (logging.status==200) {

            if (logging.data.message) {
            if (logging.data.message == 'registro no encontrado') {
                handleListLogging({status: "status: " + logging.status + ", message: " + logging.data.message})
                } else {
                    let message = JSON.parse(logging.data.message.substr(logging.data.message.indexOf("]") + 1));
                    handleListLogging({status: "status: " + message.status + ", recibo ID: " + message.reciboId + ", salarial ID: " + message.reciboSalarialId})
                }
            } else {
                handleListLogging([])
            }

        }else if (logging.status==404){
            handleListLogging({status: "status: " + logging.status + ", message: no existen recibos en el periodo solicitado"})
        }else if (logging.status==400){
            handleListLogging({status: "status: " + logging.status + ", message: el empleado no existe"})
        }else{

            handleListLogging({status: "status: " + logging.status + ", message: " + logging.data.code + " se bloqueó abruptamente el intento de conexión"})

        }
        
    }

    function handleQuerySubmit() {
        queryLogging();
    }

    useEffect(() => {
        
    }, [dispatch]);

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Log de envió MTESS
                </Typography>
                <Formsy
                    ref={formRef}
                    className="flex flex-col justify-center"
                >
                    <Paper className="p-12">
                        <Typography className="h4 mb-24">Filtros</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12} className="alignRight">
                                <TextFieldFormsy
                                    className="mb-8"
                                    type="text"
                                    name="identification"
                                    label="CI"
                                    validations={{
                                        minLength: 6
                                    }}
                                    validationErrors={{
                                        minLength:
                                            "La longitud mínima del carácter es 6"
                                    }}
                                    fullWidth
                                    value={identification}
                                    onChange={e => handleIdentification(e.target.value)}
                                />
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <KeyboardDatePicker
                                        className="mb-16"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        label="Periodo de Pago"
                                        openTo="year"
                                        format="MM/yyyy"
                                        views={["year", "month"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={handleQuerySubmit}
                                >
                                    Filtrar
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Formsy>

                <Paper className="p-12 mt-16">                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Typography className="h4 mb-24">{listLogging.status}</Typography>
                        </Grid>

                    </Grid>
                </Paper>
            </div>
        </div>
    );
}

export default LoggingList;
