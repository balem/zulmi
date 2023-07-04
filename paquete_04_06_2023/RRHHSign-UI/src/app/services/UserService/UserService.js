import axios from 'axios';

class UserService {

    async desactivate(userData) {
        return axios
            .post(process.env.REACT_APP_API_HOST + "/users/desactivate", userData);
    }

    async SavePerfiles(data) {

        return axios.post(process.env.REACT_APP_API_HOST + "/users/save-profiles", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async getUserById(id) {
        return axios.get(
            process.env.REACT_APP_API_HOST + `/users/search/${id}`,
        ).catch(function(error) {
            console.log(error);
        })
    }

    async getUsuariosPerfiles(data) {

        return axios.post(process.env.REACT_APP_API_HOST + "/users/getUsuariosPerfiles", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async getUserTypes(userEmail, userProfile) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/users/user-types"
            + ( userEmail ? `?email=${userEmail}&perfil=${userProfile}` : '' )
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getUsers() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/users/user-list"
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }


    async getUserProfiles() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/users/user-profiles"
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async changePassword(email, password) {
        return await axios.post(
            process.env.REACT_APP_API_HOST + "/users/change-password",
            {
                email,
                password,
            }
        )
    }

    async checkChangePwd(email) {
        return await axios.post(
            process.env.REACT_APP_API_HOST + "/users/check-change-pwd",
            {
                email
            }
        )
    }

    async forgotPassword(email) {
        return await axios.post(
            process.env.REACT_APP_API_HOST + "/users/forgot-password",
            {
                email,
            }
        )
    }

}

const instance = new UserService();

export default instance; 