import { SelectFormsy, TextFieldFormsy } from "@fuse";
import {
    MenuItem,
    Typography,
    Grid,
    Paper,
    Button
} from "@material-ui/core";
import Formsy from "formsy-react";
import React, { useState, useEffect } from "react";
import DocumentListReport from "app/components/DocumentListReport";
import "./DocumentReport.css";
import { KeyboardDatePicker, DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import esLocale from "date-fns/locale/es";
import Widget from "../widgets/Widget";
import { FuseAnimateGroup } from '@fuse';
import DocumentService from './../../services/DocumentsService/index';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { useSelector } from 'react-redux';
import renderIf from "../Utils/renderIf";

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import UserGroupService from "app/services/UserGroupService";
import EmployeeService from "app/services/EmployeeService";

var pfcount = 0;

function DocumentList() {
    const dispatchMsg = useDispatch();

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let mostrar = user.data.mostrar;
    let userProfile = user.role[0];
    let startDateVal = new Date();
    let endDateVal = new Date();

    startDateVal.setMonth(endDateVal.getMonth() - mostrar)
    startDateVal.setDate(1)

    endDateVal.setMonth(endDateVal.getMonth() + 1)
    endDateVal.setDate(0)
    // endDateVal.setFullYear(2020)

    const [open, setOpen] = useState(false);
    const [password, handlePassword] = useState('');
    const [statusdir, handleStatusDir] = useState('');
    const [statusemp, handleStatusEmp] = useState('');
    const [creator, handleCreator] = useState('');
    const [startDate, handleStartDateChange] = useState(startDateVal);
    const [endDate, handleEndDateChange] = useState(endDateVal);
    const [documentList, handleDocumentList] = useState([]);
    const [actualPage, handleActualPage] = useState(0);
    const [pageRefreshCount, handlePageRefreshCount] = useState(0);
    const [control, handleControl] = useState(false);
    const [sucursalGroup, handleSucursalGroup] = useState([]);
    const [sucursal, handleSucursal] = useState(0);
    const [employees, handleEmployees] = useState([]);
    const [identification, handleIdentification] = useState(false);
    const [employeename, handleEmployeeName] = useState(false);
    const [identificator, handleIdentificator] = useState('');
    

    const DOCUMENTS_PER_PAGE = 10;

    function message(type = "null", message = "") {
        dispatchMsg(
            Actions.showMessage({
                message: message,
                autoHideDuration: 4000, //ms
                anchorOrigin: {
                    vertical: "top", //top bottom
                    horizontal: "center" //left center right
                },
                variant: type //success error info warning null
            })
        );
    }

    async function groupLoad() {
        let data = await UserGroupService.getGroup();
        handleSucursalGroup(data.data.data);
    }


    const fetchEmployees = async () => {
        const result = await EmployeeService.getEmployees({
            userEmail
        });
        if (result.status === 200) {
            if (result.data.status === "success") {
                handleEmployees(result.data.data);
            } else if (result.data.status === "error") {
                handleEmployees([]);
                message("error", result.data.data);
            } else {
                message("warning", result.data.data);
            }
        } else {
            handleEmployees([]);
        }
    }

    useEffect(() => {
        //updateVisibleDocuments()
        fetchEmployees();
        groupLoad();
    }, [actualPage, pageRefreshCount])


    async function filtrar() {
        let filter = {
            start_date: startDate,
            end_date: endDate,
            empleado: employeename,
            identification: document.getElementById('identification').value,
            sucursal: sucursal,
            statusdir: statusdir,
            statusemp: statusemp,
            tipo: identificator
        };

        let documents;

        documents = await DocumentService.getDocumentsReport(filter);
        console.log(documents.data.data)
        handleDocumentList(documents.data.data)
        
    }

    function downloadExcel() {

            const query = []

            if (employeename) {
                query.push(`empleado=${employeename}`)
            }

            if (statusdir) {
                query.push(`statusdir=${statusdir}`)
            }

            if (statusemp) {
                query.push(`statusemp=${statusemp}`)
            }

            if (document.getElementById('identification').value) {
                query.push(`identification=${document.getElementById('identification').value}`)
            }

            if (startDate) {
                query.push(`date_from=${moment(startDate).format('YYYY-MM-DD')}`)
            }

            if (endDate) {
                query.push(`date_to=${moment(endDate).format('YYYY-MM-DD')}`)
            }
            
            if (sucursal) {
                query.push(`sucursal=${sucursal}`)
            }

            if (identificator) {
                query.push(`tipo=${identificator}`)
            }

            window.location.href = `${process.env.REACT_APP_API_HOST}/document/download-report`+ (
                    query.length > 0 ? `?${query.join('&')}` : ''
                )
    }

    return (
        <div className="p-24 flex flex-1 flex-center">
            <div className="fullWidth hidden-print">
                <Typography className="h1 mb-24 mt-24">
                    Control de Recibos
                </Typography>
                <Formsy className="flex flex-col justify-center">
                    <Paper className="p-12">
                        <Typography className="h4 mb-24">Filtros</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                    
                                <Grid item xs={12} md={12}>
                                    <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        id="empleado"
                                        label="Empleado"
                                        name="empleado"
                                        onChange={e => handleEmployeeName(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione un Empleado"
                                        required
                                    >
                                        <MenuItem key={0} value='ALL'>Todos los empleados</MenuItem>
                                        {employees.map(employee =>
                                            <MenuItem key={employee.id} value={employee.identification}>{employee.nombres + ' ' + employee.apellidos}</MenuItem>
                                        )}
                                    </SelectFormsy>

                                    <TextFieldFormsy
                                            className="mb-16"
                                            type="text"
                                            name="identification"
                                            id="identification"
                                            label="Ingrese ci o legajo"
                                            //onChange={e => handleIdentification(e.target.value)}
                                            fullWidth
                                        />                            
                                </Grid>

                            <Grid item xs={12} md={12} className="alignLeft">
                                     <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        name="statusdir"
                                        label="Estado de Firma Director"
                                        onChange={e => handleStatusDir(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione uno"
                                        required
                                    >
                                        <MenuItem key={0} value='ALL'>Todos</MenuItem>
                                        <MenuItem value="FIR">
                                            Firmado
                                        </MenuItem>
                                        <MenuItem value="PEN">
                                            Pendiente
                                        </MenuItem>
                                    </SelectFormsy>
                                    
                            </Grid>
                            
                                <Grid item xs={12} md={12} className="alignLeft">
                                    <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        name="sucursal"
                                        label="Sucursal"
                                        onChange={e => handleSucursal(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione uno"
                                        required
                                    >
                                    <MenuItem key={0} value='ALL'>Todos las sucursales</MenuItem>
                                       {sucursalGroup.map(group =>
                                                    <MenuItem key={group.id} value={group.name}>{group.name}</MenuItem>
                                                )}                                        
                                    </SelectFormsy>
                                </Grid>
                        </Grid>
                            <Grid item xs={6} md={6} className="alignRight">
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <KeyboardDatePicker
                                        className="mb-16"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        label="Fecha Inicial"
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
                                        className="mb-16"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        label="Fecha Final"
                                        openTo="year"
                                        format="dd/MM/yyyy"
                                        views={["year", "month", "date"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                                <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        name="statusemp"
                                        label="Estado de Firma Empleado"
                                        onChange={e => handleStatusEmp(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione uno"
                                        required
                                    >
                                        <MenuItem key={0} value='ALL'>Todos</MenuItem>
                                        <MenuItem value="FIR">
                                            Firmado
                                        </MenuItem>
                                        <MenuItem value="PEN">
                                            Pendiente
                                        </MenuItem>
                                    </SelectFormsy>
                                    <SelectFormsy
                                            className="mb-16 fullWidthSelect"
                                            name="tipo_documento"
                                            label="Tipo de documento"
                                            onChange={e => handleIdentificator(e.target.value)}
                                            //validations="isNotEqualToNone"
                                            validationError="Seleccione uno"
                                            required
                                        >
                                            <MenuItem key={0} value='ALL'>Todos los documentos</MenuItem>
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
                                
                            
                            <Grid item xs={12} className="alignRight">
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={filtrar}
                                //disabled={!isContactsFormValid}
                                >
                                    Filtrar
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Formsy>

                <Paper className="p-12 mt-16">
                    <Typography className="h2 mb-24">Resultados</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                                {(renderIf(documentList.length > 0))(
                                
                                    <DocumentListReport key={pfcount++} registro={documentList} updateFunction={filtrar} />
                                )}
                            
                        </Grid>
                    </Grid>

                    {(renderIf(documentList.length > 0 && user.role[0] == 'rh'))(
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={downloadExcel}
                                //disabled={!isContactsFormValid}
                                >
                                    Descargar Excel
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </Paper>
            </div>
        </div>
    );
}

export default DocumentList;
