import GeoService from "app/services/GeoService";
import SelectRegions from "app/components/SelectRegions";
import SelectCities from "app/components/SelectCities";
import React, { useRef, useState, useEffect } from "react";
import ReactTable from "react-table";
import Formsy, { addValidationRule } from "formsy-react";
import {
    Button,
    Typography,
    Grid,
    Paper,
    IconButton,
    Icon
} from "@material-ui/core";
import { TextFieldFormsy } from "@fuse";
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import { Store } from "app/react-store/Store";
import axios from "axios";
import AddressService from 'app/services/AddressService';

function AddressDataForm() {
    const dispatchMsg = useDispatch();

    const [isAddressesFormValid, setIsAddressesFormValid] = useState(false);

    const [addresses, handleAddresses] = useState([]);
    const [regions, handleRegions] = useState([]);
    const [selectedRegion, handleRegionChange] = useState("none");
    const [cities, handleCities] = useState([]);
    const [selectedCity, handleCityChange] = useState("none");
    const [cityName, handleCityName] = useState();
    const [regionName, handleRegionName] = useState();

    const [calle, handleCalle] = useState("");
    const [nro, handleNro] = useState("");
    const [piso, handlePiso] = useState("");
    const [dpto, handleDpto] = useState("");

    const { state, dispatch } = React.useContext(Store);

    const addressesFormRef = useRef(null);

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

    //VALIDATIONS
    addValidationRule("isNotEqualToNone", function(values, value) {
        if (value === "none") return false;

        return true;
    });

    //carrega os endereços no caso de ser uma edição
    useEffect(() => {
        const fetchAddressData = async (id, type) => {
            const result = await AddressService.getAddresses(id, type);
            if (result.status !== 200) {
                handleAddresses([]);
            } else {
                handleAddresses(result.data.data);
            }
        }
        fetchAddressData(state.registered_person_company_id, state.registered_person_company_type);
    }, [state, state.registered_person_company_id, state.registered_person_company_type]);

    //carrega as regiões (estados) e carrega os endereços do usuário no caso de edição
    useEffect(() => {   
        const fetchData = async (country_id = 10) => {
            const result = await GeoService.getRegions(country_id);
            handleRegions(result);
        };
        fetchData(10);
    }, []);

    //carrega as cidades quando é modficada a região (estado)
    useEffect(
        () => {
            const fetchData = async region_id => {
                const result = await GeoService.getCities(region_id);
                handleCities(result);
            };
            fetchData(selectedRegion);
        },
        [selectedRegion]
    );

    useEffect(
        () => {
            const fetchData = async region_id => {
                const result = await GeoService.getRegionName(region_id);
                handleRegionName(result);
            };
            fetchData(selectedRegion);
        },
        [selectedRegion]
    );

    useEffect(
        () => {
            const fetchData = async city_id => {
                const result = await GeoService.getCityName(city_id);
                handleCityName(result);
            };
            fetchData(selectedCity);
        },
        [selectedCity]
    );

    //adiciona novos endereços na tabela da tela
    async function addAddress() {
        let addressData = {
            id: state.registered_person_company_id,
            type: state.registered_person_company_type,
            street: calle,
            number: nro,
            floor: piso,
            room: dpto,
            region_id: selectedRegion,
            city_id: selectedCity
        };

        axios
            .post(
                process.env.REACT_APP_API_HOST + "/addresses/add",
                addressData
            )
            .then(async (response) => {
                let data = response.data.data;
                let status = response.data.status;
                if (status === "success") {
                    message("success", data.message);
                    const result = await AddressService.getAddresses(state.registered_person_company_id, state.registered_person_company_type);
                    if (result.status !== 200) {
                        handleAddresses([]);
                    } else {
                        handleAddresses(result.data.data);
                    }
                    handleCalle("");
                    handleNro("");
                    handlePiso("");
                    handleDpto("");
                    handleCityName();
                    handleRegionName();
                }
            })
            .catch(error => {
                let errorMessage = "Erro inesperado";
                if (error.response !== undefined)
                    errorMessage = error.response.data.data;
                message("error", errorMessage);
            });
    }

    function disableAddressesSaveButton() {
        setIsAddressesFormValid(false);
    }

    function enableAddressesSaveButton() {
        setIsAddressesFormValid(true);
    }

    async function remove(id) {
        let addressData = {
            id: id
        };
        let [status, msg] = await AddressService.delAddress(addressData);
        message(status, msg);

        const result = await AddressService.getAddresses(state.registered_person_company_id, state.registered_person_company_type);
        if (result.status !== 200) {
            handleAddresses([]);
        } else {
            handleAddresses(result.data.data);
        }
    }

    return (
        <Formsy
            //onValidSubmit={handleSubmit}
            onValid={enableAddressesSaveButton}
            onInvalid={disableAddressesSaveButton}
            ref={addressesFormRef}
            className="flex flex-col justify-center"
        >
            <Paper className="p-12 mt-16">
                <Typography className="h4 mb-24">Datos de Dirección</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="calle"
                            label="Calle"
                            value={calle}
                            fullWidth
                            required
                            onChange={e => handleCalle(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <TextFieldFormsy
                            className="my-16"
                            type="number"
                            name="nro"
                            label="Nro"
                            value={nro}
                            fullWidth
                            required
                            onChange={e => handleNro(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="piso"
                            label="Piso"
                            value={piso}
                            fullWidth
                            required
                            onChange={e => handlePiso(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <TextFieldFormsy
                            className="my-16"
                            type="text"
                            name="dpto"
                            label="Dpto"
                            value={dpto}
                            fullWidth
                            required
                            onChange={e => handleDpto(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <SelectRegions
                            regions={regions}
                            selected={selectedRegion}
                            onChange={e => {
                                handleRegionChange(e.target.value);
                                handleRegionName(e.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <SelectCities
                            cities={cities}
                            selected={selectedCity}
                            onChange={e => {
                                handleCityChange(e.target.value);
                                handleCityName(e.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            className="mx-auto mt-32"
                            aria-label="SALVAR"
                            onClick={e => {
                                addAddress();
                                handleRegionChange("none");
                                handleCityChange("none");
                            }}
                            disabled={!isAddressesFormValid}
                        >
                            Salvar
                        </Button>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <ReactTable
                            localization={{
                                pagination: {
                                    labelDisplayedRows:
                                        "{from}-{to} de {count}",
                                    labelRowsPerPage: "filas"
                                },
                                toolbar: {
                                    nRowsSelected: "{0} fila(s) seleccionada(s)"
                                },
                                header: {
                                    actions: "Acciones"
                                },
                                body: {
                                    emptyDataSourceMessage:
                                        "No hay registros que mostrar",
                                    filterRow: {
                                        filterTooltip: "Filtrar"
                                    }
                                }
                            }}
                            data={addresses}
                            onLoad={handleAddresses}
                            columns={[
                                {
                                    Header: "Calle",
                                    accessor: "street"
                                },
                                {
                                    Header: "Nro",
                                    accessor: "number"
                                },
                                {
                                    Header: "Piso",
                                    accessor: "floor"
                                },
                                {
                                    Header: "Dpto",
                                    accessor: "room"
                                },
                                {
                                    Header: "Departamento",
                                    accessor: "region_name"
                                },
                                {
                                    Header: "Localidad",
                                    accessor: "city_name"
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

export default AddressDataForm;
