import axios from 'axios';

class AddressService {
    async getAddresses(user_id, user_type) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/addresses",
            {
                params: {
                    user_id: user_id,
                    user_type: user_type
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async delAddress(filter) {
        return await axios.delete(
            process.env.REACT_APP_API_HOST + "/addresses/del",
            {
                params: {
                    id: filter.id
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then(response => {
            return [response.data.status, response.data.message];
        })
        .catch(error => {
            let errorMessage = "Erro inesperado";
            if (error.response !== undefined)
                errorMessage = error.response.data.message;
            return ["error", errorMessage];
        });
    }
}

const instance = new AddressService();

export default instance; 