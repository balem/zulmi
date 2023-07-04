import React, { useEffect, useRef, useState } from 'react';
import { Button, InputAdornment, Icon } from '@material-ui/core';
import Formsy from 'formsy-react';
import * as authActions from 'app/auth/store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "app/auth/authConfig";

function JWTLoginTab(props) {
    const dispatch = useDispatch();
    const login = useSelector(({ auth }) => auth.login);
    const [isFormValid, setIsFormValid] = useState(false);
    const formRef = useRef(null);
    const { instance } = useMsal();

    /*const handleLogin = () => {
        instance.loginPopup(loginRequest)
            .catch((error) => console.log(error))
    }*/

    function reactStorage() {
        for (var i = 0; i < sessionStorage.length; i++) {
            var key = sessionStorage.key(i);
            try {
                var val = JSON.parse(sessionStorage.getItem(key));
            } catch {
                var val = {};
            }
            if (val.hasOwnProperty('username')) {
                if (!sessionStorage.hasOwnProperty('set')) {
                    sessionStorage.setItem('set', 'true');
                }
            } 
        }
    }

    useEffect(() => {
        reactStorage();
    }, []);

    useEffect(() => {
        if (login.error && (login.error.email || login.error.password)) {
            formRef.current.updateInputsWithError({
                ...login.error
            });
            disableButton();
        }
    }, [login.error]);

    function disableButton() {
        setIsFormValid(false);
    }

    function enableButton() {
        setIsFormValid(true);
    }

    function handleSubmit(model) {
        dispatch(authActions.submitLogin(model));
    }

    return (
        <div className="w-full">
            <Formsy
                onValidSubmit={handleSubmit}
                onValid={enableButton}
                onInvalid={disableButton}
                ref={formRef}
                className="flex flex-col justify-center w-full"
            >
                {/*<TextFieldFormsy
                    className="mb-16"
                    type="text"
                    name="email"
                    label="Correo"
                    id="email"
                    // validations={{
                    //     minLength: 4
                    // }}
                    // validationErrors={{
                    //     minLength: 'Min character length is 4'
                    // }}
                    onKeyPress={window.clearInterval()}
                    InputProps={{
                        endAdornment: <InputAdornment position="end"><Icon className="text-20" color="action">email</Icon></InputAdornment>
                    }}
                    variant="outlined"
                    required
                />

                <TextFieldFormsy
                    className="mb-16"
                    type="password"
                    name="password"
                    label="Contraseña"
                    id="password"
                    // validations={{
                    //     minLength: 4
                    // }}
                    // validationErrors={{
                    //     minLength: 'Min character length is 4'
                    // }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end"><Icon className="text-20" color="action">vpn_key</Icon></InputAdornment>
                    }}
                    variant="outlined"
                    required
                />*/}

                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    className="w-full mx-auto mt-16 normal-case"
                    aria-label="LOG IN"
                    value="legacy"
                    onClick={() => instance.loginRedirect(loginRequest)}
                >
                    
                    {sessionStorage.length==1 ? 'Reitentar' : 'Continuar'}
                </Button>

            </Formsy>
        </div>
    );
}

export default JWTLoginTab;
