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
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";
import EmployeeService from "app/services/EmployeeService";
import EmployeeListItem from "app/components/EmployeeListItem";
import UserService from "app/services/UserService";
import { types } from "@babel/core";
import UserGroupService from "app/services/UserGroupService";
import ControlService from "app/services/ControlService";
import UploadEmployeeHolographicSignature from "../UploadEmployeeHolographicSignature";
import renderIf from "app/main/Utils/renderIf";

var pfcount = 0;

function EmployeeUpdateDataForm(props) {

    const { state, dispatch } = React.useContext(Store);

    const dispatchMsg = useDispatch();

    const id = props.id

    const [isFormValid, setIsFormValid] = useState(false);
    const [employees, handleEmployees] = useState([]);
    const [employeeNombres, handleEmployeeNombres] = useState();
    const [employeeApellidos, handleEmployeeApellidos] = useState();
    const [employeeEmail, handleEmployeeEmail] = useState();
    const [employeeSueldo, handleEmployeeSueldo] = useState();
    const [employeeIps, handleEmployeeIps] = useState();
    const [employeeFechaIngreso, handleEmployeeFechaIngreso] = useState();
    const [employeePassword, handleEmployeePassword] = useState();
    const [employeeIdentification, handleEmployeeIdentification] = useState();
    const [employeeDepartamentos, handleEmployeeDepartamentos] = useState([]);
    const [employeeCargos, handleEmployeeCargos] = useState([]);
    const [employeeDepartamento, handleEmployeeDepartamento] = useState();
    const [employeeCargo, handleEmployeeCargo] = useState();
    const [employeeLegajo, handleEmployeeLegajo] = useState();
    const [employeeFirmaHolografa, handleEmployeeFirmaHolografa] = useState();
    const [userTypes, handleUserTypes] = useState([]);
    const [selectedUserType, handleSelectedUserType] = useState();
    const [employeeContrato, handleEmployeeContrato] = useState();
    const [employeeGroups, handleEmployeeGroups] = useState([]);
    const [employeeUserGroup, handleEmployeeUserGroup] = useState([]);
    const [employeeMTESSPatronal, handleEmployeeMTESSPatronal] = useState();
    const [employeeAccount, handleEmployeeAccount] = useState();
    const [control, handleControl] = useState([]);
    const [employeeNroPadron, handleNroPadron] = useState();
    const contratos = ['MENSUAL', 'JORNAL', 'SEMANAL']

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let userProfile = user.role[0];

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

    const handleGroupSelect = (event) => {
        console.log('E ', event)
        const { options } = event.target;
        console.log('OPTIONS ', options)
        const value = [];
        for (let i = 0, l = options.length; i < l; i += 1) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        handleEmployeeUserGroup(value);
    };

    async function groupLoad() {
        let data = await UserGroupService.getGroup();
        handleEmployeeGroups(data.data.data);
    }

    async function controlLoad() {
        let data = await ControlService.getControl();
        handleControl(data.data.data[0].sucursal);
    }

    async function cargosLoad() {
        let data = await EmployeeService.getCargos();
        handleEmployeeCargos(data.data.data);
    }

    async function departamentoLoad() {
        let data = await EmployeeService.getDepart();
        handleEmployeeDepartamentos(data.data.data);
    }


    useEffect(() => {
        groupLoad();
        departamentoLoad();
        cargosLoad();
        controlLoad();
    }, []);

    //carrega os empregados
    useEffect(() => {
        const fetchEmployee = async () => {
            const result = await EmployeeService.getEmployeeById(id);
            const control = await ControlService.getControl();
            let groups = '';
            if (control.data.data[0].sucursal == true) {
                groups = await EmployeeService.getEmployeeGroup(id);
            }
            if (result.status === 200) {
                    const data = result.data.data
                    handleEmployeeNombres(data.nombres)
                    handleEmployeeApellidos(data.apellidos)
                    handleEmployeeEmail(data.email)
                    handleEmployeeIdentification(data.identification)
                    handleEmployeeSueldo(data.sueldoJornal)
                    //handleEmployeeIps(data.ipsEmpleado)
                    handleEmployeeContrato(data.contrato)
                    handleEmployeeFirmaHolografa(data.firmaHolografa)
                    //handleEmployeeDepartamento(data.departamento)
                    //handleEmployeeCargo(data.cargo)
                    handleEmployeeLegajo(data.legajo)
                    handleEmployeeMTESSPatronal(data.mtessPatronal);
                    handleEmployeeAccount(data.numberCount);
                    handleNroPadron(data.nro_padron);

                    if (result.data.departamento) {
                        handleEmployeeDepartamento(result.data.departamento.departamento)
                    }else{
                        console.log("sin departamento")
                    }

                    if (result.data.cargo) {
                        handleEmployeeCargo(result.data.cargo.cargo)
                    }else{
                        console.log("sin cargo")
                    }

                    if (control.data.data[0].sucursal == true) {
                        console.log(groups.data.data);
                        if (groups.data.data!=undefined) {
                            handleEmployeeUserGroup(groups.data.data[0].name);
                        }else{
                            console.log("vacio");
                        }
                    }
                    const typesRes = await UserService.getUserTypes(userEmail, userProfile)

                    if (typesRes.status === 200) {
                        if (typesRes.data.status === "success") {
                            handleUserTypes(typesRes.data.data)

                            const userRes = await EmployeeService.getEmployeeWithUserByEmailUpdate(data.email)
                            
                            console.log(userRes.data.data)
                            if (userRes.status === 200) {
                                handleSelectedUserType(userRes.data.data[0].profile_id.toUpperCase())
                            }
                        } else {
                            message("warning", "Error al recuperar los tipos de usuarios");
                        }
                    } else {
                        message("warning", "Error al recuperar los tipos de usuarios");
                    }
                
            } else {
                // handleEmployees([]);
            }
        }

        fetchEmployee();
    }, [id]);

    /* useEffect(() => {
        //carrega os grupos
        const fetchGroups = async () => {
            const result = await UserGroupService.getGroups(employeeEmail);

            if (result.status === 200) {
                if (result.data.status === "success") {
                    handleGroups(result.data.data.all);
                    handleUserGroups(result.data.data.user_selected.map(g => g.id));
                } else if (result.data.status === "error") {
                    handleGroups([]);
                    handleUserGroups([]);
                    message("error", 'Error al recuperar los grupos de la base de datos');
                } else {
                    message("error", 'Error al recuperar los grupos de la base de datos');
                }
            } else {
                handleGroups([]);
                handleUserGroups([]);
            }
        }

        if (employeeEmail) {
            fetchGroups()
        }
    }, [employeeEmail]) */

    async function remove(id) {
        let employee = {
            id: id
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
    async function update() {
        let employeeData = {
            id: id,
            nombres: employeeNombres,
            apellidos: employeeApellidos,
            sueldo_jornal: employeeSueldo,
            //ips_empleado: employeeIps,
            email: employeeEmail,
            identification: employeeIdentification,
            profile_id: selectedUserType,
            contrato: employeeContrato,
            sucursal: employeeUserGroup,
            departamento: employeeDepartamento,
            cargo: employeeCargo,
            legajo: employeeLegajo,
            mtess_patronal: employeeMTESSPatronal,
            account_number: employeeAccount,
            nro_padron: employeeNroPadron,
            creator: user.data.email,
        };
        EmployeeService.update(employeeData)
            .then(response => {
                let status = response.data.status;

                if (status === "success") {
                    message("success", "Empleado actualizado con éxito");
                    window.history.back();
                } else if (status === "error") {
                    message("error", response.data.data.message);
                }
            })
    }

    function disableSaveButton() {
        setIsFormValid(false);
    }

    function enableSaveButton() {
        setIsFormValid(true);
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
                <Typography className="h4 mb-24">Funcionários</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="nombres"
                            label="Nombres"
                            value={employeeNombres}
                            validations={{
                                minLength: 4
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud mínima del carácter es 4"
                            }}
                            fullWidth
                            required
                            onChange={e =>
                                handleEmployeeNombres(e.target.value)}
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
                                minLength: 4
                            }}
                            validationErrors={{
                                minLength:
                                    "La longitud mínima del carácter es 4"
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
                            type="number"
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
                        <TextFieldFormsy
                            className="my-16"
                            type="number"
                            name="sueldo"
                            value={employeeSueldo}
                            validations="isNumeric"
                            validationErrors="Campo valido solamente para numeros"
                            label="Sueldo/Jornal"
                            fullWidth
                            required
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
                   
                     {/*<Grid item xs={12} md={6}>
                        <SelectFormsy 
                            className="mt-16 fullWidthSelect" 
                            name="user_type" 
                            label="Tipo de Usuario" 
                            value={selectedUserType}
                            validationError="Seleccione uno" 
                            onChange={e => handleSelectedUserType(e.target.value)} 
                            required
                            fullWidth
                        >
                            {userTypes.map((type) =>
                                <MenuItem key={type.id} value={type.id}>
                                    {type.profile_name}
                                </MenuItem>
                            )}
                        </SelectFormsy>
                    </Grid>*/}
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <UploadEmployeeHolographicSignature id={id} preview={employeeFirmaHolografa} />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={2}>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            className="mx-auto mt-32"
                            aria-label="GUARDAR"
                            onClick={update}
                            disabled={!isFormValid}
                        >
                            Guardar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Formsy>
    );
}

export default EmployeeUpdateDataForm