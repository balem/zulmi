import axios from 'axios';

class CompanyService {
    async getCompany() {
        return await axios.get(
            //process.env.REACT_APP_DOTNET_API_HOST + `/api/Company/GetCompany/`,
            process.env.REACT_APP_API_HOST + '/company/list/',
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCompanyMTESS(mtess) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + '/company/mtess/' + mtess,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getAllPatronal() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/patronal/", {
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
}

const instance = new CompanyService();

export default instance;