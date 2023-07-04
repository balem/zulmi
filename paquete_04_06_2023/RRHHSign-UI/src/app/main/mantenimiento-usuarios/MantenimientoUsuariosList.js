import {
    Typography,
    Grid,
    Paper,
    Button
} from "@material-ui/core";
import Formsy from "formsy-react";
import React, { useState, useEffect } from "react";
import { TextFieldFormsy } from "@fuse";
import "./MantenimientoUsuarios.css";
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import { useSelector } from 'react-redux';
import renderIf from "../Utils/renderIf";
import UserService from "app/services/UserService";
import EmployeeService from "app/services/EmployeeService";
import Control from 'app/services/ControlService';
import Select from 'react-select'
import UserListItem from "app/components/UserListItem";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/styles';

var pfcount = 0;

const useStyles = makeStyles(theme => ({
    dialogPaper: {
        width: '400px'
    },
    tickSize: {
        transform: "scale(2)",
        marginRight: "7px"
    }
}));

function MantenimientoUsuarios() {
    const dispatchMsg = useDispatch();

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;

    const classes = useStyles();

    const [id, handleId] = useState();
    const [perfiles, handlePerfiles] = useState([]);
    const [usuarios, handleUsuarios] = useState([]);
    const [checked, setChecked] = useState([]);
    const [Open, setOpen] = useState(false);
    const [desactivateOpen, setDesactivateOpen] = useState(false);
    const [state, handlestate] = useState();
    const [name, handleName] = useState();
    const [UserDesactivate, handleUserDesactivate] = useState(false);

    async function usuarios_perfiles(id) {
        handlePerfiles([])
        handleId(id)

        var data = {
            id: id
        }

        await UserService.getUsuariosPerfiles(data)
            .then(response => {
                if (response.data.status == "success") {
                    setOpen(true);

                    handlePerfiles(response.data.data.usuarios_perfiles)
                    let array = response.data.data.checked
                    let check = []

                    for (let i = 0; i < array.length; i++) {
                        check.push(array[i])
                    }

                    if (array.length > 0) {
                        setChecked(check)
                    } else {
                        setChecked([])
                    }

                } else {
                    message("error", JSON.stringify(response.data.message));
                }
            }).catch(error => {
                console.log(error)
                message("error", error);
            });
    }

    async function handleDesactivateUser() {
        setDesactivateOpen(false);

        var responseDesactivate = await UserService.desactivate(UserDesactivate)

        if (responseDesactivate.status == 200) {
            message("success", responseDesactivate.data.message);
        } else {
            message("error", responseDesactivate.data.message);
        }

        fetchUsuarios();

    }

    async function handleCancelClose() {
        setOpen(false);
        setDesactivateOpen(false)
    }

    // Add/Remove checked item from list
    const handleCheck = (event) => {
        var updatedList = [...checked];
        if (event.target.checked) {
            updatedList = [...checked, event.target.value];
        } else {
            updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
    };

    var isChecked = (item) => checked.includes(item) ? "checked-item" : "not-checked-item";

    async function fetchPerfiles() {
        const result = await UserService.getUserProfiles();
        handlePerfiles(result.data.data)
    }

    async function fetchUsuarios() {
        const result = await UserService.getUsers();
        handleUsuarios(result.data.data)
    }

    function toggleActivate(id, activate, nombre) {
        handlestate(activate)
        handleName(nombre)
        setDesactivateOpen(true);

        let employeeData = {
            id: id,
            active: activate ? 1 : 0,
            creator: userEmail,
        }

        handleUserDesactivate(employeeData)
    }

    async function handleAsignarPerfiles() {

        let data = {
            user_id: id,
            perfiles: checked,
            creator: userEmail
        }

        await UserService.SavePerfiles(data)
            .then(response => {
                if (response.data.status == "success") {
                    message("success", "Registro actualizado exitósamente");
                    fetchPerfiles()
                } else {
                    message("error", response.data.message);
                }
                handleCancelClose()
            }).catch(error => {
                console.log(error)
                let errorMessage = "Error inesperado";
                if (error.response !== undefined)
                    errorMessage = error.response.data.data;
                message("error", errorMessage);
            });
    }

    useEffect(() => {
        fetchPerfiles()
        fetchUsuarios()
    }, []);

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

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">

                <Dialog open={desactivateOpen} onClose={handleCancelClose} classes={{ paper: classes.dialogPaper }} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-deactivate-dialog-title">{state == 1 ? "Activar" : "Desactivar"} Usuario</DialogTitle>
                    <DialogContent>
                        Usuario: {name}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelClose} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleDesactivateUser} color="primary">
                            {state == 1 ? "Activar" : "Desactivar"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={Open} onClose={handleCancelClose} classes={{ paper: classes.dialogPaper }} aria-labelledby="form-dialog-title">
                    <div align='right'><Button onClick={handleCancelClose} color="primary">
                        X
                    </Button></div>
                    <DialogTitle id="form-deactivate-dialog-title">Asignar Perfiles</DialogTitle>
                    <DialogContent>
                        <Grid item xs={6} md={8}>
                            {(renderIf(perfiles.length > 0))(
                                <div>

                                    {perfiles.map(item =>
                                        <>
                                            <div key={item.id}>
                                                <input className={classes.tickSize} value={item.id} type="checkbox" defaultChecked={item.check} onChange={handleCheck} />
                                                <span className={isChecked(item)} style={{ fontSize: '18px' }}> {item.profile_name}</span>
                                            </div><br></br>
                                        </>
                                    )}

                                </div>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelClose} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleAsignarPerfiles} color="primary">
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>

                <Typography className="h2 mb-24">
                    Mantenimiento de Usuarios
                </Typography>

                <Grid item xs={12} md={12}>
                    {(renderIf(usuarios.length > 0))(
                        <UserListItem key={pfcount++} toggleActivate={toggleActivate} registro={usuarios} usuarios_perfiles={usuarios_perfiles}></UserListItem>
                    )}
                </Grid>
            </div>
        </div>

    );
}

export default MantenimientoUsuarios;
