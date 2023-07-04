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
import UploadEmployees from "../UploadEmployees";
import UserGroupService from "app/services/UserGroupService";
import UserGroupListItem from "../UserGroupListItem";

var pfcount = 0;

export default function UserGroupDataForm(props) {
    const dispatchMsg = useDispatch();

    const [isFormValid, setIsFormValid] = useState(false);
    const [groups, handleGroups] = useState([]);
    const [name, handleName] = useState();
    
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
    const fetchGroups = async () => {
        const result = await UserGroupService.getGroups(userEmail);

        if (result !== undefined) {
            if (result.status === 200) {
                if (result.data.status === "success") {
                    handleGroups(result.data.data.all);
                } else if (result.data.status === "error") {
                    handleGroups([]);
                    message("error", 'Error al recuperar los grupos de la base de datos');
                } else {
                    message("error", 'Error al recuperar los grupos de la base de datos');
                }
            } else {
                handleGroups([]);
            }
        }
    }
    useEffect(() => {
        fetchGroups();
    }, [state]);

    //adiciona novos empregados
    async function add() {
        let data = {
            name: name,
        };
        UserGroupService.insertGroup(data)
            .then(response => {
                let data = response.data.data;
                let status = response.data.status;

                if (status === "success") {
                    message("success", 'Grupo insertado con éxito');
                    //TODO: LIMPAR O FORM
                    handleName();
                    setIsFormValid(false);
                    fetchGroups()
                } else if (status === "error") {
                    message("error", 'Error al insertar grupo');
                }
            })
            .catch(error => {
                let errorMessage = "Error inesperado";
                if (error.response !== undefined)
                    errorMessage = error.response.data.data;
                message("error", errorMessage);
            });
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
                <Typography className="h4 mb-24">Sucursales / Grupos</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="name"
                            label="Nombre de la sucursal"
                            value={name}
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
                                handleName(e.target.value)}
                        />
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
                            onClick={add}
                            disabled={!isFormValid}
                        >
                            Guardar
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        {groups.map(group => {
                            var reg = {
                                id: group.id,
                                name: group.name,
                            }
                            return (
                                <UserGroupListItem
                                    key={pfcount++}
                                    registro={reg}
                                    updateFunction={add}
                                />
                            );
                        })}
                        
                    </Grid>
                </Grid>
                
            </Paper>
        </Formsy>
    );
}
