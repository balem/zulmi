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
export default function EnfermedadesProfesionales() {
    const formRef = useRef(null);
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Enfermedades Profesionales
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
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="Motivo"
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
            </div>
        </div>
    );
}