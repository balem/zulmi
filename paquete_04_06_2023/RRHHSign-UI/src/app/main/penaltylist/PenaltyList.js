import { SelectFormsy, TextFieldFormsy } from '@fuse';
import { MenuItem, Typography, Grid, Paper, Button } from '@material-ui/core';
import Formsy from 'formsy-react';
import React, { useRef, useState, useEffect } from "react";
import "./PenaltyList.css";
import PenaltyService from 'app/services/PenaltyService';
import CompanyService from 'app/services/CompanyService';
import PenaltyRecordListItemMainList from 'app/components/PenaltyRecordListItemMainList';
import { Store } from "app/react-store/Store";
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";

function PenaltyList() {
    const formRef = useRef(null);
    const { state, dispatch } = React.useContext(Store);
    const dispatchMsg = useDispatch();

    const [listCompanies, handleListCompanies] = useState([]);
    const [listPenalty, handleListPenalty] = useState([]);
    const [ips, handleIps] = useState('');
    const [identification, handleIdentification] = useState('');

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

    async function queryPenalty() {
        let data = {}
        if (ips) {
            data.ipsPatronal = ips
        }
        if (identification) {
            data.identification = identification
        }
        const penalty = await PenaltyService.getPenalty(data, userEmail)
        console.log(penalty)

        if(penalty.status===200){

          if (penalty.data.messages) {
                handleListPenalty(penalty.data.messages.map(penalty => {
                    if (penalty.level === 'Error') {
                        return {
                            id: 0,
                            message: penalty.error[0]
                        }
                    } else {
                        return {
                            id: penalty.Datos_empleado.id_empleado,
                            estado: penalty.Datos_empleado.estado_del_empleado,
                            tipo: penalty.Datos_empleado.tipo_de_multa
                        }
                    }  
                }))
            } else if (penalty.data['Datos_empleados ']) {
                handleListPenalty(penalty.data['Datos_empleados '].map(penalty => {
                    return {
                        id: penalty.id_empleado,
                        estado: penalty.estado_del_empleado,
                        tipo: penalty.tipo_de_multa
                    }
                }))
            } else {
                handleListPenalty([])
            }

        }else{
            message("error", penalty.statusText +": se bloqueó abruptamente el intento de conexión");
        }

       
    }
    async function queryCompanies() {
        const companies = await CompanyService.getAllPatronal()
        if (companies.data.data) {
            handleListCompanies(companies.data.data.map(company => ({
                mtess_patronal: company.mtess_patronal
            })))
        } else {
            handleListCompanies([])
        }
    }

    function handleQuerySubmit() {
        queryPenalty();
    }

    useEffect(() => {
        queryCompanies();
    }, []);

    useEffect(() => {
        
    }, [dispatch]);

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">
                    Consulta de Multas MTESS
                </Typography>
                <Formsy
                    ref={formRef}
                    className="flex flex-col justify-center"
                >
                    <Paper className="p-12">
                        <Typography className="h4 mb-24">Filtros</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <SelectFormsy
                                    key={'inputPatronal'}
                                    className="mb-16 fullWidthSelect"
                                    name="ips"
                                    label="Seleccione el Nro Patronal"
                                    value="T"
                                    validationError="Seleccione uno"
                                    required
                                    onChange={e => handleIps(e.target.value)}
                                >
                                    {
                                        listCompanies.map(companie => {
                                            return <MenuItem key={companie.mtess_patronal} value={companie.mtess_patronal}>{companie.mtess_patronal}</MenuItem>
                                        })
                                    }
                                </SelectFormsy>
                            </Grid>
                            <Grid item xs={12} md={12} className="alignRight">
                                <TextFieldFormsy
                                    key={'inputCI'}
                                    className="mb-16"
                                    type="text"
                                    name="identification"
                                    label="CI"
                                    validations={{
                                        minLength: 6
                                    }}
                                    validationErrors={{
                                        minLength:
                                            "La longitud mínima del carácter es 6"
                                    }}
                                    fullWidth
                                    value={identification}
                                    onChange={e => handleIdentification(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={handleQuerySubmit}
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
                            <PenaltyRecordListItemMainList key={'A'} registro={listPenalty} updateFunction={queryPenalty} />
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div>
    );
}

export default PenaltyList;
