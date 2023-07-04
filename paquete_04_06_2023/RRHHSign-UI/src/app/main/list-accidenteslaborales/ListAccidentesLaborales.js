import React, { useRef, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { Typography, Grid, Paper } from "@material-ui/core";
import Formsy from "formsy-react";
import esLocale from "date-fns/locale/es";
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    DatePicker
} from '@material-ui/pickers';
import AccidentesLaboralesListItem from "app/components/AccidentesLaboralesListItem/index";

const AccidentesLaborales=[
    {
        id:1,
        nombre: "Argos",
        fecha:"12/05/2020",
        motivo:"atrasado"
    },
    {
        id:2,
        nombre: "Andre",
        fecha:"12/05/2020",
        motivo:"atrasado"
    },
    {
        id:3,
        nombre: "Magno",
        fecha:"12/05/2020",
        motivo:"atrasado"
    },    
]
var pfcount=0;
export default function ListAccidentesLaborales() {
    const formRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [accidenteslaboralesList, setAccidentesLaboralesList] = useState(AccidentesLaborales);
    function filtrar (){}

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Lista Accidentes Laborales
                </Typography>
                <Formsy ref={formRef} className="flex flex-col justify-center">
                    <Paper className="p-24">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha Accidentes Laborales"
                                        value={selectedDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedDate}
                                        fullWidth
                                    />
                                </MuiPickersUtilsProvider>
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Motivo Accidentes Laborales"
                                    multiline
                                    rowsMax="4"
                                    //value={values.multiline}
                                    //onChange={handleChange('multiline')}
                                    margin="normal"
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
                    </Paper>
                </Formsy>
                <Paper className="p-12 mt-16">
                    <Typography className="h2 mb-24">Resultados</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            {accidenteslaboralesList.map(accidenteslaborales => {
                                console.log(accidenteslaborales);
                                var reg = {
                                    id: accidenteslaborales.Id,
                                    nombre: accidenteslaborales.nombre,
                                    fecha: accidenteslaborales.fecha,                                    
                                    motivo: accidenteslaborales.motivo
                                }
                                return (<AccidentesLaboralesListItem key={pfcount++} registro={reg} updateFunction={filtrar} />);
                            })}
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div>
    );
}