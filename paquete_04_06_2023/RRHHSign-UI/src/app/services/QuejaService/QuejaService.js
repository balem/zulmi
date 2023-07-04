import axios from 'axios';

class QuejaService {
    
    async sendSupport(
        email,
        queja,
    ) {
        return await axios.post(
            process.env.REACT_APP_API_HOST + `/message/support`,
            {
                email,
                queja,
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

}

const instance = new QuejaService();

export default instance; 