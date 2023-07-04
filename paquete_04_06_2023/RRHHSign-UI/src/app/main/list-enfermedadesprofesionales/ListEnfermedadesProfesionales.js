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
import EnfermedadesProfesionalesListItem from "app/components/EnfermedadesProfesionalesListItem/index";

const EnfermedadesProfesionales = [
    {
        id: 1,
        nombre: "Argos",
        fecha: "12/05/2020",
        motivo: "atrasado"
    },
    {
        id: 2,
        nombre: "Andre",
        fecha: "12/05/2020",
        motivo: "atrasado"
    },
    {
        id: 3,
        nombre: "Magno",
        fecha: "12/05/2020",
        motivo: "atrasado"
    },
]
var pfcount = 0;
export default function ListEnfermedadesProfesionales() {
    const formRef = useRef(null);
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const [enfermedadesprofesionalesList, setEnfermedadesProfesionalesList] = useState(EnfermedadesProfesionales);
    const [values, setValues] = React.useState({      
    });
    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value });
    };
    function filtrar() { }

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Lista Enfermedades Profesionales
                </Typography>
                <Formsy ref={formRef} className="flex flex-col justify-center">
                    <Paper className="p-24">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha Comunicación"
                                        value={selectedStartDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedStartDate}
                                        fullWidth
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} md={12} >

                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Fecha Ultimo Examen Medico"
                                        value={selectedEndDate}
                                        format="dd/MM/yyyy"
                                        onChange={setSelectedEndDate}
                                        fullWidth
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs={12} md={12} >
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Domicilio Prestador Médico"
                                    multiline
                                    rowsMax="4"
                                    //value={values.multiline}
                                    //onChange={handleChange('multiline')}
                                    margin="normal"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={12} >
                                <TextField
                                    id="standard-number"
                                    label="Tel. Prestador Medico"
                                    value={values.age}
                                    onChange={handleChange('age')}
                                    type="number"
                                    //className={classes.textField}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
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
                            {enfermedadesprofesionalesList.map(enfermedadesprofesionales => {
                                console.log(enfermedadesprofesionales);
                                var reg = {
                                    id: enfermedadesprofesionales.Id,
                                    nombre: enfermedadesprofesionales.nombre,
                                    fecha: enfermedadesprofesionales.fecha,
                                    motivo: enfermedadesprofesionales.motivo
                                }
                                return (<EnfermedadesProfesionalesListItem key={pfcount++} registro={reg} updateFunction={filtrar} />);
                            })}
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div >
    );
}