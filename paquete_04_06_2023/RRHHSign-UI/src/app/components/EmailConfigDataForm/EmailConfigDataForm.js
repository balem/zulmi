import {
    MenuItem,
    Typography,
    Grid,
    Paper,
    Icon,
    IconButton,
    Button,
    TextField
} from "@material-ui/core";
import React, { useRef, useState, useEffect } from "react";
import ReactTable from "react-table";
import { SelectFormsy, TextFieldFormsy } from "@fuse";
import Formsy from "formsy-react";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import axios from "axios";
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";
import EmployeeService from "app/services/EmployeeService";
import EmployeeListItem from "app/components/EmployeeListItem";
import UserService from "app/services/UserService";
import { types } from "@babel/core";
import EmailConfigService from "app/services/EmailConfigService";
import renderIf from "app/main/Utils/renderIf";


var pfcount = 0;

function EmailConfigDataForm(props) {

    const { state, dispatch } = React.useContext(Store);

    const dispatchMsg = useDispatch();

    const slug = props.slug

    const [isFormValid, setIsFormValid] = useState(false);
    const [subject, handleSubject] = useState();
    const [messageText, handleMessageText] = useState();
    
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
        console.log('Slug: ', slug)
        const fetchConfig = async () => {
            const result = await EmailConfigService.getConfig(slug);
            console.log('Email config res: ', result)
            
            if (result.status === 200) {
                if (result.data && result.data.data.length > 0) {
                    const data = result.data.data[0]
                    handleSubject(data.subject)
                    handleMessageText(data.message)
                } else {
                    message("warning", "Empleado no encontrado");
                }
            } else {
                // handleEmployees([]);
            }
        }
        fetchConfig();
    }, [slug]);

    //adiciona novos empregados
    async function update() {
        let emailData = {
            subject: subject,
            message: messageText,
        };
        
        EmailConfigService.updateConfig(slug, emailData)
            .then(response => {
                let status = response.data.status;

                if (status === "success") {
                    message("success", "Configuración guardada exitósamente");
                } else if (status === "error") {
                    message("error", `Error al actualizar configuración (${response.data.data})`);
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
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="asunto"
                            label="Asunto"
                            value={subject}
                            fullWidth
                            required
                            onChange={e =>
                                handleSubject(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            id="standard-multiline-flexible"
                            label="Mensaje"
                            multiline
                            rowsMax="4"
                            //value={values.multiline}
                            //onChange={handleChange('multiline')}
                            margin="normal"
                            value={messageText}
                            validations={{
                                isLength: 255
                            }}
                            validationErrors={{
                                isLength: "la logitud maxima de los caracteres es 255"
                            }}
                            onChange={e => handleMessageText(e.target.value)}
                            fullWidth
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

export default EmailConfigDataForm