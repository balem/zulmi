import {
    MenuItem,
    Typography,
    Grid,
    Paper,
    Icon,
    IconButton,
    Button
} from "@material-ui/core";
import React, { useRef, useState, useEffect } from "react";
import ReactTable from "react-table";
import { SelectFormsy, TextFieldFormsy } from "@fuse";
import Formsy from "formsy-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";
import EmployeeService from "app/services/EmployeeService";
import EmployeeListItem from "app/components/EmployeeListItem";
import UploadEmployees from "../UploadEmployees";
import LoadLogsService from "app/services/LoadLogsService";
import LoadLogsListItem from "../LoadLogsListItem";
import moment from 'moment';
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import esLocale from "date-fns/locale/es";
import momentESLocale from "moment/locale/es";

var pfcount = 0;

export default function LoadLogsList(props) {
    const dispatchMsg = useDispatch();

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;

    const [isFormValid, setIsFormValid] = useState(false);
    const [logs, handleLogs] = useState([]);
    const [mespago, handleMesPago] = useState([])
    const [fecha, handleFecha] = useState([]);
    const { state, dispatch } = React.useContext(Store);

    const formRef = useRef(null);

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

    //carrega os empregados
    const fetchLogs = async () => {
        let query = {}
        if (fecha) {
            query.mes_de_pago = fecha
        }

        const result = await LoadLogsService.getLogs(query);
        if ((result) && (result.status === 200)) {
            if (result.data.status === "success") {
               
                let datos = [];
                for (var i = 0; i < result.data.data.length; i++) {
                    var created_at_hora = result.data.data[i].created_at.split("T")[1];
                    var hora = created_at_hora.split(".")[0];
                    datos.push({
                        id: result.data.data[i].id,
                        identificacion: result.data.data[i].identificacion,
                        empleado: result.data.data[i].empleado,
                        legajo: result.data.data[i].legajo,
                        descripcion: result.data.data[i].descripcion,
                        numero_recibo: result.data.data[i].numero_recibo,
                        mes_de_pago: moment(result.data.data[i].mes_de_pago.split("T")[0]).format("MM/YYYY"),
                        created_at: moment(result.data.data[i].created_at.split("T")[0]).format("DD-MM-YYYY")+" "+hora
                    })
                }

                handleLogs(datos);
            } else if (result.data.status === "error") {
                handleLogs([]);
                message("error", result.data.data);
            } else {
                message("warning", result.data.data);
            }
        } else {
            handleLogs([]);
        }
    }
    //carrega os empregados
    const fetchMesPago = async () => {
        const result = await LoadLogsService.getDates();
            if (result.data.status === "success") {
                var arr_date = new Array();
                
                for (var i = 0; i < result.data.data.length; i++) {
                    var fecha = result.data.data[i].mes_de_pago.split("T")[0];
                    var ahno = fecha.substring(0, 4);
                    var mes = fecha.substring(5, 7);
                    arr_date[i] = {'mes_de_pago' : mes + '/' + ahno};
                }
   
                handleMesPago(arr_date);
            } else if (result.data.status === "error") {
                handleMesPago([]);
                message("error", result.data.data);
            } else {
                message("warning", result.data.data);
            }
    }

    useEffect(() => {
        fetchMesPago();
        //fetchLogs();
    }, [state]);

    function downloadEmployeesProblem() {
        if (fecha) {
            console.log("fecha enviada="+fecha);
            window.location.href = `${process.env.REACT_APP_API_HOST}/document/problem-employees-excel?fecha=${fecha}`
        }
    }

    return (
        <div>
            <Formsy //onValidSubmit={handleSubmit}
                //onValid={enableButton}
                //onInvalid={disableButton}
                //ref={formRef}
                className="flex flex-col justify-center">
                <Paper className="p-12">
                    <Typography className="h4 mb-24">Filtros</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <SelectFormsy
                                className="mb-16 fullWidthSelect"
                                name="status"
                                label="MesPago"
                                onChange={e => handleFecha(e.target.value)}
                                //validations="isNotEqualToNone"
                                validationError="Seleccione El Periodo de Pago"
                                required
                            >
                                <MenuItem key={0} value='ALL'>Todos los periodos</MenuItem>
                                {mespago.map(mes =>
                                    <MenuItem key={mes.mes_de_pago} value={mes.mes_de_pago} >
                                        {mes.mes_de_pago}
                                    </MenuItem>
                                )}
                            </SelectFormsy>
                            
                        </Grid>
                        <Grid item xs={6} className="alignLeft">
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                className="mx-auto mt-32"
                                aria-label="Filtrar"
                            onClick={fetchLogs}
                            //disabled={!isContactsFormValid}
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
                        {logs.map(log => {
                            var reg = {
                                id: log.id,
                                identificacion: log.identificacion,
                                legajo: log.legajo,
                                empleado: log.empleado,
                                descripcion: log.descripcion,
                                nrorecibo: log.numero_recibo,
                                mes_de_pago: log.mes_de_pago,
                                created_at: log.created_at,
                            }
                            return (
                                <LoadLogsListItem
                                    key={pfcount++}
                                    registro={reg}
                                />
                            );
                        })}                        
                    </Grid>
                </Grid>
            </Paper>
        </div>
    );
}
