import axios from 'axios';

class ComunicacionService {
    
    async getHeader() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/evidence/header`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getDetail(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/evidence/detail?id=${DocumentId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

}

const instance = new ComunicacionService();

export default instance; 