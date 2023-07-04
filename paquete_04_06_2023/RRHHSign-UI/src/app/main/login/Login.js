import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, Tabs, Tab } from '@material-ui/core';
import { darken } from '@material-ui/core/styles/colorManipulator';
import { FuseAnimate } from '@fuse';
import clsx from 'clsx';
import JWTLoginTab from './tabs/JWTLoginTab';
import * as authActions from 'app/auth/store/actions';
//import FirebaseLoginTab from './tabs/FirebaseLoginTab';
//import Auth0LoginTab from './tabs/Auth0LoginTab';
import { makeStyles } from '@material-ui/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDispatch } from "react-redux";
import Formsy from "formsy-react";
import { SelectFormsy, TextFieldFormsy } from "@fuse";
import {
    MenuItem,
    Typography,
    Grid,
    Paper,
    Button
} from "@material-ui/core";
import axios from 'axios';

const useStyles = makeStyles(theme => ({
    root: {
        background: 'linear-gradient(to right, ' + theme.palette.primary.dark + ' 0%, ' + darken(theme.palette.primary.dark, 0.5) + ' 100%)',
        color: theme.palette.primary.contrastText
    },
    dialogPaper: {

        width: '400px'
    }
}));

function Login() {

    const dispatchMsg = useDispatch();
    const classes = useStyles();
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState(0);
    const [open, setOpen] = useState(false);
    const [email, handleEmail] = useState('');
    const [perfiles, handlePerfiles] = useState([]);
    const [perfil, handlePerfil] = useState();

    function reactStorage() {

        console.log("session: "+sessionStorage.length)

        console.log(JSON.stringify(sessionStorage))

        for (var i = 0; i < sessionStorage.length; i++) {
            var key = sessionStorage.key(i);
            try {
                var val = JSON.parse(sessionStorage.getItem(key));
                console.log(val)
            } catch {
                var val = {};
            }
            if (val.username) {
                console.log("loguearse")
                login(val.username)
            }
        }
    }

    async function login(email) {

        await axios.get(
            process.env.REACT_APP_API_HOST + "/users/profile"
            + (email ? `?email=${email}` : '')
        ).then((response) => {

            handleEmail(response.data.perfiles[0].email)

            if (response.data.perfiles.length > 1) {
                handlePerfiles(response.data.perfiles)
                setOpen(true);
                console.log("permisos especiales");
            } else {
                console.log("iniciar sesion directamente");
                dispatch(authActions.submitEmail(email, response.data.perfiles[0].profile_slug));
            }

            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    useEffect(() => {
        reactStorage();
    }, []);

    async function handleCancelClose() {
        setOpen(false);
    }

    async function handleClose() {
        setOpen(false);
    }

    function handleSubmit() {
        dispatch(authActions.submitEmail(email, perfil));
    }

    return (
        <div className="w-full flex flex-col flex-auto">
            <div className={clsx(classes.root, "flex flex-col flex-1 flex-shrink-0 p-24 md:flex-row md:p-0")}>

                <div style={{ backgroundImage: 'url(assets/images/logos/talento_100.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                    className="flex flex-col flex-grow-0 items-center text-white p-16 text-center md:p-12 md:items-start md:flex-shrink-0 md:flex-1 ">
                    <div>
                        {/* <img className="w-384 mb-32" src="assets/images/logos/main_logo.png" alt="logo" /> <br /> */}
                        <img className="mb-32" style={{ width: '40rem', marginLeft: "50%" }} src="assets/images/logos/logo.png" alt="logo" />
                    </div>

                    {/* <div className="row">
                    <FuseAnimate animation="transition.expandIn">
                        <img className="w-128 mb-8" src="assets/images/logos/logo_digitalife.png" alt="logo" />
                    </FuseAnimate>
                    &nbsp;&nbsp;&nbsp;
                    <FuseAnimate animation="transition.expandIn">
                        <img className="w-128 mb-8" src="assets/images/logos/main_logo.png" alt="logo" />
                    </FuseAnimate>
                </div> */}

                    <div>
                        {/* <img className="w-384 mb-32" src="assets/images/logos/main_logo.png" alt="logo" /> <br /> */}
                        {/* <img style={{width:'12rem', marginLeft: '10%'}} src="assets/images/logos/cliente.png" alt="" /> */}
                    </div>
                </div>

                <FuseAnimate animation={{ translateX: [0, '100%'] }}>

                    <Card className="w-full max-w-400 mx-auto m-16 md:m-0" square>

                        <CardContent className="flex flex-col items-center justify-center p-32 md:p-48 md:pt-128 ">

                            <Typography variant="h6" className="text-center md:w-full mb-48">INGRESE A SU CUENTA</Typography>

                            {/* <Tabs
                            value={selectedTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            className="mb-32"
                        >
                            <Tab
                                icon={<img className="h-40 p-4 bg-black rounded-12" src="assets/images/logos/jwt.svg" alt="jwt"/>}
                                className="min-w-0"
                                label="JWT"
                            />
                            <Tab
                                icon={<img className="h-40" src="assets/images/logos/firebase.svg" alt="firebase"/>}
                                className="min-w-0"
                                label="Firebase"
                            />
                            <Tab
                                icon={<img className="h-40" src="assets/images/logos/auth0.svg" alt="auth0"/>}
                                className="min-w-0"
                                label="Auth0"
                            />
                        </Tabs> */}
                            <span style={{ marginTop: '10px', cursor: 'pointer' }}>Bienvenido a talento100, para iniciar sesion debe dar click sobre el boton continuar</span>

                            {selectedTab === 0 && <JWTLoginTab />}

                            {/*<span style={{ marginTop: '10px', cursor: 'pointer' }} onClick={handleClickOpen}>Olvidé mi contraseña</span>
                        <span style={{ marginTop: '10px', cursor: 'pointer' }} onClick={reloadPage}>Refrescar Aplicación</span>*/}
                            {/*selectedTab === 1 && <FirebaseLoginTab/>*/}
                            {/*selectedTab === 2 && <Auth0LoginTab/>

                        {<div className="flex flex-col items-center justify-center pt-32">
                            <span className="font-medium">En caso de tener problemas con el acceso a la aplicación, por favor pulse sobre "Refrescar Aplicación" para actualizar su Navegador</span>
                        </div>}*/}

                        </CardContent>
                    </Card>
                </FuseAnimate>

                <Formsy className="flex flex-col justify-center">
                    <Dialog open={open} onClose={handleClose} classes={{ paper: classes.dialogPaper }} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Seleccione el Perfil</DialogTitle>
                        <DialogContent>
                            <Grid item xs={12} md={8}>
                                <TextFieldFormsy
                                    className="my-16"
                                    type="text"
                                    name="email"
                                    value={email}
                                    label="Email"
                                    fullWidth
                                    disabled
                                    onChange={e =>
                                        handleEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={12} className="alignRight">
                                <SelectFormsy
                                    className="mb-16 fullWidthSelect"
                                    name="perfil"
                                    id="perfil"
                                    label="Seleccione un perfil"
                                    value=""
                                    onChange={e => handlePerfil(e.target.value)}
                                    //validations="isNotEqualToNone"
                                    validationError="Por favor seleccione un perfil"
                                    required
                                >

                                    {perfiles.map(item =>
                                        <MenuItem key={item.profile_slug} value={item.profile_slug}>{item.profile_name}</MenuItem>
                                    )}

                                </SelectFormsy>
                            </Grid>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCancelClose} color="primary">
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} color="primary">
                                Continuar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Formsy>
            </div>
        </div>
    )
}

export default Login;
