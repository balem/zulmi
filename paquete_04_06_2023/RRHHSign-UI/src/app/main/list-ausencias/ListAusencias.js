import React, { useRef, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { Typography, Grid, Paper } from "@material-ui/core";
import Formsy from "formsy-react";
import esLocale from "date-fns/locale/es";
import DateFnsUtils from '@date-io/date-fns';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';

import {
    MuiPickersUtilsProvider,
    DatePicker
} from '@material-ui/pickers';
import AusenciasListItem from "app/components/AusenciasListItem/index";
const Ausencias = [
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
export default function ListAusencias() {
    const useStyles = makeStyles(theme => ({
        button: {
            display: 'block',
            marginTop: theme.spacing(2),
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 200,
        },
    }));

    const formRef = useRef(null);
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const [ausenciasList, setAusenciasList] = useState(Ausencias);
    const classes = useStyles();
    const [tipo, setTipo] = React.useState('');
    const [open, setOpen] = React.useState(false);

    function handleChange(event) {
        setTipo(event.target.value);
    }

    function handleClose() {
        setOpen(false);
    }

    function handleOpen() {
        setOpen(true);
    }
    function filtrar() { }

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Lista Ausencias
                </Typography>
                <Formsy ref={formRef} className="flex flex-col justify-center">
                    <Paper className="p-24">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12} >
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                    <DatePicker
                                        views={["year", "month", "date"]}
                                        label="Desde Fecha"
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
                                        label="Hasta Fecha"
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
                                    label="Obs. Ausencia"
                                    multiline
                                    rowsMax="4"
                                    //value={values.multiline}
                                    //onChange={handleChange('multiline')}
                                    margin="normal"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={12} >
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="tipo">Tipo de ausencia </InputLabel>
                                    <Select
                                        open={open}
                                        onClose={handleClose}
                                        onOpen={handleOpen}
                                        value={tipo}
                                        onChange={handleChange}
                                        inputProps={{
                                            id: 'tipo',
                                        }}
                                        fullWidth
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value={10}>  Justificada   </MenuItem>
                                        <MenuItem value={20}>   Injustificada   </MenuItem>
                                    </Select>
                                </FormControl>
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
                            {ausenciasList.map(ausencias => {
                                console.log(ausencias);
                                var reg = {
                                    id: ausencias.Id,
                                    nombre: ausencias.nombre,
                                    fecha: ausencias.fecha,
                                    motivo: ausencias.motivo
                                }
                                return (<AusenciasListItem key={pfcount++} registro={reg} updateFunction={filtrar} />);
                            })}
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div >
    );
}