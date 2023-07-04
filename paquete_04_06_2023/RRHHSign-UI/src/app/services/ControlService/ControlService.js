import { mockEmployees } from '../../main/document-form/MockData';
import axios from 'axios';
import moment from 'moment';

class ControlService {

    constructor() {
        //console.log('Creating DocumentsService')
    }

    async getTypeCert(data) {
        return axios.get(
            process.env.REACT_APP_API_HOST + `/control/type-cert/${data}`,
        ).catch(function (error) {
            console.log(error);
        })
    }

    async getControl() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/control/`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getControlSigners() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/control/signning`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEquibalent() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/control/equibalent`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
}


const instance = new ControlService()
export default instance