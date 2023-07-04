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
//import Message from 'app/components/Message';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";
import ContactService from 'app/services/ContactService';

export default function UserDataForm() {
    const dispatchMsg = useDispatch();

    const [isContactsFormValid, setIsContactsFormValid] = useState(false);
    const [contacts, handleContacts] = useState([]);
    const [contactType, handleContactTypeChange] = useState("none");
    const [contactNumber, handleContactNumberChange] = useState();

    const { state, dispatch } = React.useContext(Store);

    const contactsFormRef = useRef(null);

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

    //carrega os contatos no caso de ser uma edição
    useEffect(() => {
        const fetchContactData = async (id, type) => {
            const result = await ContactService.getContacts(id, type);
            if (result.status !== 200) {
                handleContacts([]);
            } else {
                handleContacts(result.data.data);
            }
        }
        fetchContactData(state.registered_person_company_id, state.registered_person_company_type);
    }, [state, state.registered_person_company_id, state.registered_person_company_type]);


    async function remove(id) {
        let contactData = {
            id: id
        };
        let [status, msg] = await ContactService.delContact(contactData);
        message(status, msg);

        const result = await ContactService.getContacts(state.registered_person_company_id, state.registered_person_company_type);
        if (result.status !== 200) {
            handleContacts([]);
        } else {
            handleContacts(result.data.data);
        }
    }

    //adiciona novos contatos na tabela da tela
    async function addContact() {
        let contactTypeDescription = "";
        switch (contactType) {
            case "C":
                contactTypeDescription = "Comercial";
                break;
            case "P":
                contactTypeDescription = "Personal";
                break;
            case "R":
                contactTypeDescription = "Residencial";
                break;

            default:
                break;
        }

        let contactData = {
            id: state.registered_person_company_id,
            type: state.registered_person_company_type,
            phone_type: contactTypeDescription,
            number: contactNumber
        };
        axios
            .post(process.env.REACT_APP_API_HOST + "/contacts/add", contactData)
            .then(response => {
                let data = response.data.data;
                let status = response.data.status;
                if (status === "success") {
                    message("success", data);
                    var c = contacts;
                    c = c.concat([
                        { tipo: contactTypeDescription, numero: contactNumber }
                    ]);
                    handleContacts(c);
                    handleContactTypeChange("none");
                    handleContactNumberChange();
                }
            })
            .catch(error => {
                let errorMessage = "Erro inesperado";
                if (error.response !== undefined)
                    errorMessage = error.response.data.data;
                message("error", errorMessage);
            });
    }

    function disableContactsSaveButton() {
        setIsContactsFormValid(false);
    }

    function enableContactsSaveButton() {
        setIsContactsFormValid(true);
    }

    return (
        <Formsy
            //onValidSubmit={handleSubmit}
            onValid={enableContactsSaveButton}
            onInvalid={disableContactsSaveButton}
            ref={contactsFormRef}
            className="flex flex-col justify-center"
        >
            <Paper className="p-12 mt-16">
                <Typography className="h4 mb-24">Datos de Contacto</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <SelectFormsy
                            className="my-16 fullWidthSelect"
                            name="contact_type"
                            label="Tipo"
                            value="none"
                            validations="isNotEqualToNone"
                            validationError="Seleccione uno"
                            onChange={e =>
                                handleContactTypeChange(e.target.value)}
                            required
                        >
                            <MenuItem value="none">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value="C">Comercial</MenuItem>
                            <MenuItem value="P">Personal</MenuItem>
                            <MenuItem value="R">Residencial</MenuItem>
                        </SelectFormsy>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="numero"
                            label="Número"
                            value={contactNumber}
                            fullWidth
                            required
                            onChange={e =>
                                handleContactNumberChange(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            className="mx-auto mt-32"
                            aria-label="SALVAR"
                            onClick={addContact}
                            disabled={!isContactsFormValid}
                        >
                            Salvar
                        </Button>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <ReactTable
                            data={contacts}
                            onLoad={handleContacts}
                            columns={[
                                {
                                    Header: "Tipo",
                                    accessor: "type"
                                },
                                {
                                    Header: "Número",
                                    accessor: "number"
                                },
                                {
                                    Header: "",
                                    width: 128,
                                    Cell: row =>
                                        <div className="flex items-center">
                                            {/* <IconButton
                                            // onClick={(ev) => {
                                            //     ev.stopPropagation();
                                            //     dispatch(Actions.toggleStarredContact(row.original.id))
                                            // }}
                                            >
                                                <Icon>edit</Icon>
                                            </IconButton> */}
                                            <IconButton
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    remove(row.original.id);
                                            }}
                                            >
                                                <Icon>delete</Icon>
                                            </IconButton>
                                        </div>
                                }
                            ]}
                            defaultPageSize={5}
                            className="-striped -highlight"
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Formsy>
    );
}
