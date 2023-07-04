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
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";
import EmployeeService from "app/services/EmployeeService";
import UserGroupService from "app/services/UserGroupService";
import ControlService from "app/services/ControlService";
import EmployeeListItem from "app/components/EmployeeListItem";
import UploadEmployees from "../UploadEmployees";
import renderIf from "app/main/Utils/renderIf";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/styles';

var pfcount = 0;

const useStyles = makeStyles(theme => ({
     dialogPaper: {
       
        width : '400px'
    }
}));

export default function EmployeeDataForm(props) {

    console.log('PROPS LIST: ', props)
    const dispatchMsg = useDispatch();
    const classes = useStyles();
    const [isFormValid, setIsFormValid] = useState(false);
    const [employees, handleEmployees] = useState([]);
    const [visibleEmployees, handleVisibleEmployees] = useState([]);
    const [actualPage, handleActualPage] = useState(0);
    const [pageRefreshCount, handlePageRefreshCount] = useState(0);
    const [employeeNombres, handleEmployeeNombres] = useState();
    const [employeeApellidos, handleEmployeeApellidos] = useState();
    const [employeeEmail, handleEmployeeEmail] = useState();
    const [employeeSueldo, handleEmployeeSueldo] = useState();
    const [employeeIps, handleEmployeeIps] = useState();
    const [employeeFechaIngreso, handleEmployeeFechaIngreso] = useState();
    const [employeePassword, handleEmployeePassword] = useState();
    const [employeeIdentification, handleEmployeeIdentification] = useState();
    const [employeeContrato, handleEmployeeContrato] = useState();
    const [employeeDepartamentos, handleEmployeeDepartamentos] = useState([]);
    const [employeeCargos, handleEmployeeCargos] = useState([]);
    const [employeeDepartamento, handleEmployeeDepartamento] = useState();
    const [employeeCargo, handleEmployeeCargo] = useState();
    const [employeeLegajo, handleEmployeeLegajo] = useState();
    const [employeeMTESSPatronal, handleEmployeeMTESSPatronal] = useState();
    const [employeeGroups, handleEmployeeGroups ] = useState([]);
    const [employeeUserGroup, handleEmployeeUserGroup] = useState();
    const [employeeAccount, handleEmployeeAccount] = useState();
    const [employeeNroPadron, handleNroPadron] = useState();
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [employeeDesactivate, handleemployeeDesactivate ] = useState([]);
    const [stateemployee, handlestateemployee ] = useState();
    

    const [control, handleControl] = useState([]);

    const EMPLOYEES_PER_PAGE = 10;

    const contratos = ['MENSUAL', 'JORNAL', 'SEMANAL']

    const { state, dispatch } = React.useContext(Store);

    const formRef = useRef(null);

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;

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
    const fetchEmployees = async () => {
        const result = await EmployeeService.getEmployees({
            userEmail: userEmail
        });
        if (result.status === 200) {
            if (result.data.status === "success") {
                handleEmployees(result.data.data);
                updatePage(0)
            } else if (result.data.status === "error") {
                handleEmployees([]);
                message("error", result.data.data);
            } else {
                message("warning", result.data.data);
            }
        } else {
            handleEmployees([]);
            console.log('Employees stat not 200')
        }
    }

    const updatePage = (page) => {
        console.log('New selected Page: ', page)
        handleActualPage(page)
    }

    const updateVisibleEmployees = (forcePage) => {
        const start = (forcePage ? forcePage : actualPage) * EMPLOYEES_PER_PAGE
        const newVisibleEmployees = employees.slice(start, (start + EMPLOYEES_PER_PAGE))
        console.log('start: ', start)
        console.log('Visible employees arr: ', newVisibleEmployees)
        handleVisibleEmployees(newVisibleEmployees)
    }

    async function groupLoad() {
        let data = await UserGroupService.getGroup();
        handleEmployeeGroups(data.data.data);
    }

    async function cargosLoad() {
        let data = await EmployeeService.getCargos();
        handleEmployeeCargos(data.data.data);
    }

    async function departamentoLoad() {
        let data = await EmployeeService.getDepart();
        handleEmployeeDepartamentos(data.data.data);
    }

    async function controlLoad() {
        let data = await ControlService.getControl();
        handleControl(data.data.data[0].sucursal);
    }

    useEffect(() => {
        groupLoad();
        departamentoLoad();
        cargosLoad();
        controlLoad();
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [state]);

    useEffect(() => {
        handlePageRefreshCount(pageRefreshCount + 1)
    }, [employees])

    useEffect(() => {
        console.log('Actual page changed')
        updateVisibleEmployees()
    }, [actualPage, pageRefreshCount])

    async function remove(id) {
        let employee = {
            id: id,
            creator: user.data.email,
        };
        let [status, msg] = await EmployeeService.delEmployee(employee);
        message(status, msg);

        //     const result = await ContactService.getContacts(state.registered_person_company_id, state.registered_person_company_type);
        //     if (result.status !== 200) {
        //         handleContacts([]);
        //     } else {
        //         handleContacts(result.data.data);
        //     }
    }

    //adiciona novos empregados
    async function add() {
        let employeeData = {
            nombres: employeeNombres,
            apellidos: employeeApellidos,
            sueldo_jornal: employeeSueldo,
            ips_empleado: employeeIps,
            email: employeeEmail,
            identification: employeeIdentification,
            fecha_ingreso: employeeFechaIngreso,
            contrato: employeeContrato,
            legajo: employeeLegajo,
            departamento: employeeDepartamento,
            cargo: employeeCargo,
            nromtesspatronal: employeeMTESSPatronal,
            sucursal: employeeUserGroup,
            creator: user.data.email,
            account_number: employeeAccount,
            nro_padron: employeeNroPadron
        };
        axios
            .post(process.env.REACT_APP_API_HOST + "/employees/add", employeeData)
            .then(response => {
                let data = response.data.data;
                let status = response.data.status;

                if (status === "success") {
                    var e = employees;
                    e = e.concat([
                        { nombres: employeeNombres, apellidos: employeeApellidos, sueldo_jornal: employeeSueldo, fecha_ingreso: employeeFechaIngreso, ips_empleado: employeeIps, email: employeeEmail, identification: employeeIdentification }
                    ]);
                    message("success", response.data.data);
                    handleEmployees(e);
                    //TODO: LIMPAR O FORM
                    handleEmployeeNombres();
                    handleEmployeeApellidos();
                    handleEmployeeEmail();
                    //handleEmployeeFechaIngreso();
                    handleEmployeeIdentification();
                    handleEmployeeIps();
                    handleEmployeePassword();
                    handleEmployeeSueldo();
                    handleEmployeeCargo();
                    handleEmployeeDepartamento();
                    handleEmployeeLegajo();
                    handleEmployeeMTESSPatronal();
                    handleEmployeeAccount();
                    handleNroPadron();
                    setIsFormValid(false);
                } else if (status === "error") {
                    message("error", data);
                }
                fetchEmployees();
            })
            .catch(error => {
                fetchEmployees();
                handleEmployeeNombres();
                    handleEmployeeApellidos();
                    handleEmployeeEmail();
                    //handleEmployeeFechaIngreso();
                    handleEmployeeIdentification();
                    handleEmployeeIps();
                    handleEmployeePassword();
                    handleEmployeeSueldo();
                    handleEmployeeCargo();
                    handleEmployeeDepartamento();
                    handleEmployeeLegajo();
                    handleEmployeeMTESSPatronal();
                    handleEmployeeAccount();
                    handleNroPadron();
                    setIsFormValid(false);
                console.log(error)
                let errorMessage = "No se pudo enviar el correo electrónico!";
                message("error", errorMessage+": "+ JSON.stringify(error.message));
            });
    }

    function toggleActivate(id, activate, nombre) {

        handlestateemployee(activate)

        setDeactivateOpen(true); 
        
            let employeeData = {
                id: id,
                active: activate ? 1 : 0,
                creator: user.data.email,
            }
            handleemployeeDesactivate(employeeData)
    }

    function disableSaveButton() {
        setIsFormValid(false);
    }

    function enableSaveButton() {
        setIsFormValid(true);
    }

    async function handleDeactivateCancelClose() {
        setDeactivateOpen(false);
    }

    async function handleDeactivateClose() {
        setDeactivateOpen(false);

        var responseDesactivate = await EmployeeService.desactivate(employeeDesactivate)

        if (responseDesactivate.status==200) {
            message("success", responseDesactivate.data.message);
            fetchEmployees();
        }else{
            message("error", "No se pudo desactivar el empleado!");
            fetchEmployees();
        }

    }

    return (
        <Formsy
            //onValidSubmit={handleSubmit}
            onValid={enableSaveButton}
            onInvalid={disableSaveButton}
            ref={formRef}
            className="flex flex-col justify-center"
        >
            <Paper className="p-12 mt-16">
             <Dialog open={deactivateOpen} onClose={handleDeactivateClose} classes={{ paper : classes.dialogPaper}} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-deactivate-dialog-title">{stateemployee == 1 ? "Activar" : "Desactivar" } Usuario</DialogTitle>
                <DialogContent>
                    
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeactivateCancelClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDeactivateClose} color="primary">
                        {stateemployee == 1 ? "Activar" : "Desactivar"} 
                    </Button>
                </DialogActions>
            </Dialog>
                <Typography className="h4 mb-24">Funcionarios</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="nombres"
                            label="Nombres"
                            value={employeeNombres}
                            validations={{
                                minLength: 3
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud mínima del carácter es 3"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeNombres(e.target.value)}
                            inputProps={{
                            autocomplete: 'new-password',
                            form: {
                              autocomplete: 'off',
                            },
                          }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="apellidos"
                            label="Apellidos"
                            value={employeeApellidos}
                            validations={{
                                minLength: 3
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud mínima del carácter es 3"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeApellidos(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="email"
                            label="Correo Electronico"
                            value={employeeEmail}
                            validations="isEmail"
                            validationError="Este no es un correo electrónico válido"
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="identification"
                            label="Cedula de Identidad"
                            value={employeeIdentification}
                            validations={{
                                maxLength: 20
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud máxima del carácter es 20"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeIdentification(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                         <SelectFormsy 
                            className="mt-16 fullWidthSelect" 
                            name="departamento" 
                            label="Departamento" 
                            value={employeeDepartamento}
                            validationError="Seleccione uno" 
                            onChange={e => handleEmployeeDepartamento(e.target.value)} 
                            required
                            fullWidth
                        >
                            {employeeDepartamentos.map(departamento =>
                                <MenuItem key={departamento.id} value={departamento.desc_departamento}>{departamento.desc_departamento}</MenuItem>
                            )}
                        </SelectFormsy>
                    </Grid>
                    <Grid item xs={12} md={6}>
                       <SelectFormsy 
                            className="mt-16 fullWidthSelect" 
                            name="cargo" 
                            label="Cargo" 
                            value={employeeCargo}
                            validationError="Seleccione uno" 
                            onChange={e => handleEmployeeCargo(e.target.value)} 
                            required
                            fullWidth
                        >
                            {employeeCargos.map(cargo =>
                                <MenuItem key={cargo.id} value={cargo.desc_cargo}>{cargo.desc_cargo}</MenuItem>
                            )}
                        </SelectFormsy>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="sueldo"
                            value={employeeSueldo}
                            label="Sueldo/Jornal"
                            fullWidth
                            
                            onChange={e =>
                                handleEmployeeSueldo(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="account"
                            label="Número de Cuenta"
                            value={employeeAccount}
                            fullWidth
                            required
                            validations={{
                                maxLength: 255
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud máxima del carácter es 255"
                            }}
                            onChange={e =>
                                handleEmployeeAccount(e.target.value)}
                        />
                    </Grid>
                     
                </Grid>
                <Grid container spacing={3}>
                   <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="legajo"
                            label="Nro de Legajo"
                            value={employeeLegajo}
                            fullWidth
                            required
                            validations={{
                                maxLength: 255
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud máxima del carácter es 255"
                            }}
                            onChange={e =>
                                handleEmployeeLegajo(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="nropadron"
                            label="Numero Padrón"
                            value={employeeNroPadron}
                            fullWidth
                            required
                            onChange={e =>
                                handleNroPadron(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="mtress"
                            label="MTESS Patronal"
                            value={employeeMTESSPatronal}
                            validations={{
                                minLength: 3
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud mínima del carácter es 3"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeMTESSPatronal(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SelectFormsy 
                            className="mt-16 fullWidthSelect" 
                            name="contrato" 
                            label="Contrato" 
                            value={employeeContrato}
                            validationError="Seleccione uno" 
                            onChange={e => handleEmployeeContrato(e.target.value)} 
                            required
                            fullWidth
                        >
                            {contratos.map(contrato =>
                                <MenuItem key={contrato} value={contrato}>{contrato}</MenuItem>
                            )}
                        </SelectFormsy>
                    </Grid>
                    
                </Grid>
                <Grid container spacing={3}>
                    {control == false ? <Grid item xs={12} md={6}></Grid> : 
                        <Grid item xs={12} md={6}>
                            {employeeGroups.length == 0 ? <Grid item xs={12} md={6}></Grid> :
                                <SelectFormsy 
                                    className="mt-16 fullWidthSelect" 
                                    name="sucursal" 
                                    label="Sucursal" 
                                    value={employeeUserGroup}
                                    validationError="Seleccione uno" 
                                    onChange={e => handleEmployeeUserGroup(e.target.value)} 
                                    required
                                    fullWidth
                                >
                                    {employeeGroups.map(group => 
                                        <MenuItem key={group.id} value={group.name}>{group.name}</MenuItem>
                                    )}  
                                        
                                </SelectFormsy>
                            }
                        </Grid>
                    }
                     </Grid>
                    <Grid container spacing={3}>
                    <Grid item xs={12} md={2}>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            className="mx-auto mt-32"
                            aria-label="SALVAR"
                            onClick={add}
                            disabled={!isFormValid}
                        >
                            Salvar
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <UploadEmployees fetchEmployees={fetchEmployees}/>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        {(renderIf(employees.length > 0))(   
                            <EmployeeListItem key={pfcount++} registro={employees} toggleActivate={toggleActivate}></EmployeeListItem>              
                        )}
                    </Grid>
                    
                </Grid>
                
            </Paper>
        </Formsy>
    );
}
