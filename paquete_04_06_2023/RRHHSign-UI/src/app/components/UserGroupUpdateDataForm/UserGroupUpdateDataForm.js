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


var pfcount = 0;

function UserGroupUpdateDataForm(props) {

    const { state, dispatch } = React.useContext(Store);

    const dispatchMsg = useDispatch();

    const id = props.id

    const [isFormValid, setIsFormValid] = useState(false);
    const [name, handleName] = useState();

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;

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
    useEffect(() => {
        const fetchGroup = async () => {
            const result = await UserGroupService.getGroupById(id);
            
            if (result.status === 200) {
                if (result.data.data.user_selected.length > 0) {
                    const data = result.data.data.user_selected[0]
                    if (data.name) {
                        handleName(data.name)
                    } else {
                        handleName(result.data.data[0].all.name)
                    }

                } else {
                    message("warning", "Empleado no encontrado");
                }
            } else {
                // handleEmployees([]);
            }
        }
        fetchGroup();
    }, [id]);

    //adiciona novos empregados
    async function update() {
        let data = {
            id: id,
            name: name,
        };
        
        UserGroupService.updateGroup(data)
            .then(response => {
                let status = response.data.status;

                if (status === "success") {
                    message("success", "Grupo actualizado con éxito");
                } else if (status === "error") {
                    message("error", 'Error al actualizar grupo');
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
                <Typography className="h4 mb-24">Grupo de Usuarios</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="name"
                            label="Nombre del Grupo"
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

export default UserGroupUpdateDataForm