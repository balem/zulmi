import axios from 'axios';

class PatronalService {
    async getPatronal() {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Patronal/GetPatronal`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
    async getPatronalByCompany(mtess) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/patronal/` + mtess,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
}

const instance = new PatronalService();

export default instance; 