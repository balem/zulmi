import React, { useRef, useState, useEffect } from "react";
import { Paper, Grid, TextField, MenuItem, Typography, Button } from "@material-ui/core";
import Formsy from "formsy-react";
import Upload from "./../../components/Upload/Upload";
import esLocale from "date-fns/locale/es";
import { KeyboardDatePicker, DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { Store } from "app/react-store/Store";
import { SelectFormsy } from "@fuse";

const doc = {
    date: new Date().toLocaleString(esLocale, { month: 'long' }),
    closeDate: new Date().toLocaleString(esLocale),
    description: 'Recibo de salário',
    employees: 1,
    documents: 1,
    creator: 'Magno Oliveira'
}

export default function PaymentReceiptDataForm() {
    const formRef = useRef(null);

    const { state, dispatch } = React.useContext(Store);

    const [isFormValid, setIsFormValid] = useState(false);
    const [startDate, handleStartDate] = useState(state.start_pay_date);
    const [endDate, handleEndDate] = useState(state.end_pay_date);
    const [fechaPago, handleFechaPago] = useState(state.fecha_de_pago);
    const [identificator, handleIdentificator] = useState(state.document_identificator);
    const [observacion, handleObservacion] = useState();

    useEffect(() => {
        dispatch({
            type: "CHANGE_START_PAY_DATE",
            payload: startDate
        });
    }, [startDate]);

    useEffect(() => {
        dispatch({
            type: "CHANGE_END_PAY_DATE",
            payload: endDate
        });
    }, [endDate]);

    useEffect(() => {
        dispatch({
            type: "SET_DOCUMENT_IDENTIFICATOR",
            payload: identificator
        });
    }, [identificator]);

    useEffect(() => {
        dispatch({
            type: "SET_DOCUMENT_OBSERVATION",
            payload: observacion
        });
    }, [observacion]);

    useEffect(() => {
        dispatch({
            type: "SET_DOCUMENT_FECHA_PAGO",
            payload: fechaPago
        });
    }, [fechaPago]);

    function disableSaveButton() {
        setIsFormValid(false);
    }

    function enableSaveButton() {
        setIsFormValid(true);
    }

    return (
        <React.Fragment>
            <Paper className="p-12 mt-16">
                <Formsy ref={formRef} className="flex flex-col justify-center">
                    <Grid container spacing={3}>
                        <Grid item xs={6} md={6}>
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <KeyboardDatePicker
                                    className="mt-16"
                                    value={startDate}
                                    onChange={handleStartDate}
                                    label="Fecha de pago inicial"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                    required
                                />
                            </MuiPickersUtilsProvider>
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <KeyboardDatePicker
                                    className="mt-16"
                                    value={endDate}
                                    onChange={handleEndDate}
                                    label="Fecha de pago final"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                    required
                                />
                            </MuiPickersUtilsProvider>
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                                locale={esLocale}
                            >
                                <KeyboardDatePicker
                                    className="mt-16"
                                    value={fechaPago}
                                    onChange={handleFechaPago}
                                    label="Fecha de acreditación de pago"
                                    openTo="year"
                                    format="dd/MM/yyyy"
                                    views={["year", "month", "date"]}
                                    fullWidth
                                    required
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                       {/*<Grid item xs={6} md={6}>
                            <TextField
                                id="standard-multiline-flexible"
                                label="Observación"
                                multiline
                                rowsMax="4"
                                //value={values.multiline}
                                //onChange={handleChange('multiline')}
                                margin="normal"
                                value={observacion}
                                onChange={e => handleObservacion(e.target.value)}
                                fullWidth
                            />
                        </Grid>*/}
                        <Grid item xs={6} md={6}>
                            <SelectFormsy
                                            className="mb-16 fullWidthSelect"
                                            name="tipo_documento"
                                            label="Tipo de documento"
                                            onChange={e => handleIdentificator(e.target.value)}
                                            //validations="isNotEqualToNone"
                                            validationError="Seleccione uno"
                                            required
                                        >
                                            <MenuItem value="Salario">
                                                Salario
                                            </MenuItem>
                                            <MenuItem value="Aguinaldo">
                                                Aguinaldo
                                            </MenuItem>
                                            <MenuItem value="Gratificación">
                                                Gratificación
                                            </MenuItem>
                                            <MenuItem value="Bono">
                                                Bono
                                            </MenuItem>
                            </SelectFormsy>
                        </Grid>
                    </Grid>
                </Formsy>
            </Paper>
            <Upload />
            {/* <PaymentReceiptImportSummary doc={doc} /> */}
            {/* <WhatsappNotification /> */}
        </React.Fragment>
    );
}
