import React, { useState, useEffect } from 'react';
import { Avatar, Button, Icon, ListItemIcon, ListItemText, Popover, MenuItem, Typography, Grid } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import * as authActions from 'app/auth/store/actions';
import { Link } from 'react-router-dom';
import LogsService from "app/services/LogsService";
import Formsy from "formsy-react";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { SelectFormsy, TextFieldFormsy } from "@fuse";
import { makeStyles } from '@material-ui/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
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


function UserMenu(props) {
    const dispatch = useDispatch();
    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let userProfile = user.role[0];
    const classes = useStyles();
    const [userMenu, setUserMenu] = useState(null);
    const [perfiles, handlePerfiles] = useState([]);
    const [perfil, handlePerfil] = useState();
    const [email, handleEmail] = useState('');
    const [countperfiles, handleCountPerfiles] = useState('')
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (user.role.length>0) {
            axios.get(
                process.env.REACT_APP_API_HOST + "/users/profile"
                + (userEmail ? `?email=${userEmail}` : '')
            ).then((response) => {
                handleCountPerfiles(response.data.perfiles.length)
    
                return response;
            }).catch((error) => {
                return error.response;
            });
        }
        
    }, []);

    async function ChangeProfile() {

        await axios.get(
            process.env.REACT_APP_API_HOST + "/users/profile"
            + (userEmail ? `?email=${userEmail}` : '')
        ).then((response) => {

            handleEmail(response.data.perfiles[0].email)
            handlePerfiles(response.data.perfiles)
            setOpen(true);

            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async function handleCancelClose() {
        setOpen(false);
    }

    async function handleClose() {
        setOpen(false);
    }

    function handleSubmit() {
        dispatch(authActions.submitEmail(email, perfil)).then((response) => {
            if (response.type == 'LOGIN_SUCCESS') {
                setOpen(false)
                window.location.reload(true)
            }
        }).catch((error) => {
            return error.response;
        });
    }

    const userMenuClick = event => {
        setUserMenu(event.currentTarget);
    };

    const userMenuClose = () => {
        setUserMenu(null);
        LogsService.createLogs(userEmail);
    };

    return (

        <React.Fragment>

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
                        <Grid item xs={12} md={12} className="alignLeft">
                            <SelectFormsy
                                className="mb-16 fullWidthSelect"
                                name="perfil"
                                id="perfil"
                                label="Seleccione un perfil"
                                value={userProfile}
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

            <Button className="h-64" onClick={userMenuClick}>
                {user.data.photoURL ?
                    (
                        <Avatar className="" alt="user photo" src={user.data.photoURL} />
                    )
                    :
                    (
                        <Avatar className="">
                            {user.data.displayName[0]}
                        </Avatar>
                    )
                }

                <div className="hidden md:flex flex-col ml-12 items-start">
                    <Typography component="span" className="normal-case font-600 flex">
                        {user.data.displayName}
                    </Typography>
                    <Typography className="text-11 capitalize" color="textSecondary">
                        {user.role.toString() == 'director' ? 'Director' : (user.role.toString() == 'rh' || user.role.toString() == 'rh_not_signer') ? 'RRHH' : user.role.toString() == 'funcionario' ? 'Empleado' : ''}
                    </Typography>
                </div>

                <Icon className="text-16 ml-12 hidden sm:flex" variant="action">keyboard_arrow_down</Icon>
            </Button>

            <Popover
                open={Boolean(userMenu)}
                anchorEl={userMenu}
                onClose={userMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                classes={{
                    paper: "py-8"
                }}
            >
                {!user.role || user.role.length === 0 ? (
                    <React.Fragment>
                        <MenuItem component={Link} to="/login">
                            <ListItemIcon className="min-w-40">
                                <Icon>lock</Icon>
                            </ListItemIcon>
                            <ListItemText className="pl-0" primary="Iniciar sesión" />
                        </MenuItem>
                        {/* <MenuItem component={Link} to="/register">
                            <ListItemIcon className="min-w-40">
                                <Icon>person_add</Icon>
                            </ListItemIcon>
                            <ListItemText className="pl-0" primary="Register"/>
                        </MenuItem> */}
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        {countperfiles > 1 ?
                            <MenuItem onClick={ChangeProfile}>
                                <ListItemIcon className="min-w-40">
                                    <Icon>account_circle</Icon>
                                </ListItemIcon>
                                <ListItemText className="pl-0" primary="Cambiar Perfil" />
                            </MenuItem>
                            : ''}

                        {/*<MenuItem component={Link} to="/apps/mail" onClick={userMenuClose}>
                            <ListItemIcon className="min-w-40">
                                <Icon>mail</Icon>
                            </ListItemIcon>
                            <ListItemText className="pl-0" primary="Bandeja de entrada"/>
                        </MenuItem> */}
                        <MenuItem
                            onClick={() => {
                                dispatch(authActions.logoutUser());
                                userMenuClose();
                            }}
                        >
                            <ListItemIcon className="min-w-40">
                                <Icon>exit_to_app</Icon>
                            </ListItemIcon>
                            <ListItemText className="pl-0" primary="Cerrar sesión" />
                        </MenuItem>
                    </React.Fragment>
                )}
            </Popover>
        </React.Fragment>
    );
}

export default UserMenu;
