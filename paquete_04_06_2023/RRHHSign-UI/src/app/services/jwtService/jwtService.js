import axios from 'axios';
import jwtDecode from 'jwt-decode';
import FuseUtils from '@fuse/FuseUtils';
import qs from 'qs';
import * as Actions from 'app/store/actions';
import aes256 from 'aes256';

class jwtService extends FuseUtils.EventEmitter {

    init()
    {
        this.setInterceptors();
        this.handleAuthentication();
    }

    setInterceptors = () => {
        axios.interceptors.response.use(response => {
            return response;
        }, err => {
            return new Promise((resolve, reject) => {
                if (err.response !== undefined) {
                    if ( err.response.status === 401 && err.config && !err.config.__isRetryRequest ) {
                        // if you ever get an unauthorized response, logout the user
                        this.emit('onAutoLogout', 'Invalid access_token');
                        this.setSession(null);
                    }
                }
                throw err;
            });
        });
    };

    handleAuthentication = () => {

        let access_token = this.getAccessToken();

        if ( !access_token ) {
            return;
        }

        if ( this.isAuthTokenValid(access_token) )  {
            this.setSession(access_token);
            this.emit('onAutoLogin', true);
        } else {
            this.setSession(null);
            this.emit('onAutoLogout', 'El acesso ha caducado.');
        }
    };

    createUser = (data) => {
        return new Promise((resolve, reject) => {
            axios.post(process.env.REACT_APP_API_HOST+'/users/register', data)
                .then(response => {
                    if ( response.data.user ) {
                        this.setSession(response.data.access_token);
                        resolve(response.data.user);
                    } else {
                        reject(response.data.error);
                    }
                });
        });
    };

    signInWithEmail = (email, perfil) => {
        //Se agrega para el cifrado y la clave REACT_APP_KEY_PASS= dentro del .env ruc + razon social como aparecen en la tabla company de la base de datos correspondiente
        //debugger;
        var key = process.env.REACT_APP_KEY_PASS;
        var data = {'email': aes256.encrypt(key, email.toLowerCase().trim()), 'perfil': perfil};
        //var dataEncrypt = qs.stringify(data);
        const options = {
            method: 'POST',
            url: process.env.REACT_APP_API_HOST+'/users/loginemail',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data)
        };
        return new Promise((resolve, reject) => {
            axios(options).then(response => {
                if ( response.data.auth ) {
                    this.setSession(response.data.token);
                    resolve(response.data.user);
                } else {
                    reject(response.data.error);
                }
            }).catch(() => {
                this.emit('onAutoLogout', 'Usuario o contraseña erroneos, por favor pulse sobre Olvidé mi contraseña.');
            });
        });
    };

    /*signInWithEmail = (email) => {
        //Se agrega para el cifrado y la clave REACT_APP_KEY_PASS= dentro del .env ruc + razon social como aparecen en la tabla company de la base de datos correspondiente
        //debugger;
        var key = process.env.REACT_APP_KEY_PASS;
        var data = {'email': aes256.encrypt(key, email.toLowerCase().trim())};
        //var dataEncrypt = qs.stringify(data);
        const options = {
            method: 'POST',
            url: process.env.REACT_APP_API_HOST+'/users/loginemail',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data)
        };
        return new Promise((resolve, reject) => {
            axios(options).then(response => {
                if ( response.data.auth ) {
                    this.setSession(response.data.token);
                    resolve(response.data.user);
                } else {
                    reject(response.data.error);
                }
            }).catch(() => {
                this.emit('onAutoLogout', 'Usuario o contraseña erroneos, por favor pulse sobre Olvidé mi contraseña.');
            });
        });
    };*/

    signInWithEmailAndPassword = (email, password) => {
        //Se agrega para el cifrado y la clave REACT_APP_KEY_PASS= dentro del .env ruc + razon social como aparecen en la tabla company de la base de datos correspondiente
        var key = process.env.REACT_APP_KEY_PASS;
        var data = {'email': email.toLowerCase().trim(), 'password': password.trim()};
        //var dataEncrypt = qs.stringify(data);
        const options = {
            method: 'POST',
            url: process.env.REACT_APP_API_HOST+'/users/login',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data)
        };
        return new Promise((resolve, reject) => {
            axios(options).then(response => {
                if ( response.data.auth ) {
                    this.setSession(response.data.token);
                    resolve(response.data.user);
                } else {
                    reject(response.data.error);
                }
            }).catch(() => {
                this.emit('onAutoLogout', 'Usuario o contraseña erroneos, por favor pulse sobre Olvidé mi contraseña.');
            });
        });
    };

    signInWithToken = () => {
        const options = {
            method: 'GET',
            url: process.env.REACT_APP_API_HOST+'/users/access-token',
            headers: { 'content-type': 'application/x-access-token',
            "Authorization" : `Bearer ${this.getAccessToken()}` }//,
            //data: qs.stringify(data)
        };
        return new Promise((resolve, reject) => {
            axios(options).then(response => {
                if ( response.data.user ) {
                    this.setSession(response.data.token);
                    resolve(response.data.user);
                } else {
                    reject(response.data.error);
                }
            }).catch(error => {
                Actions.showMessage({message: error.message})
            });
        });
    };

    updateUserData = (user) => {
        return axios.post(process.env.API_HOST+'/users/update', {
            user: user
        });
    };

    setSession = access_token => {
        if ( access_token ) {
            localStorage.setItem('jwt_access_token', access_token);
            axios.defaults.headers.common['Authorization'] = access_token;
        } else {
            localStorage.removeItem('jwt_access_token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    logout = () => {
        this.setSession(null);
        window.open(process.env.REACT_APP_AUTHORITY+process.env.REACT_APP_TENAND_ID+'/oauth2/v2.0/logout?post_logout_redirect_uri='+process.env.REACT_APP_REDIRECT_URI)
        //window.location.reload(true);
    };

    isAuthTokenValid = access_token => {
        if ( !access_token ) {
            return false;
        }
        const decoded = jwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if ( decoded.exp < currentTime ) {
            return false;
        } else {
            return true;
        }
    };

    getAccessToken = () => {
        return window.localStorage.getItem('jwt_access_token');
    };
}

const instance = new jwtService();

export default instance;
