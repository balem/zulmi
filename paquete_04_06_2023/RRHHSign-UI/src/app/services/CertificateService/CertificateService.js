import { mockEmployees } from '../../main/document-form/MockData';
import axios from 'axios';
import moment from 'moment';

class CertificateService {

    constructor() {
        //console.log('Creating CertificateService')
    }

    async checkCertificate(email) {
        return axios.get(
            process.env.REACT_APP_API_HOST + `/certificate/check?email=${email}`,
        ).catch(function (error) {
            console.log(error);
        })
    }
    
}

const instance = new CertificateService()
export default instance