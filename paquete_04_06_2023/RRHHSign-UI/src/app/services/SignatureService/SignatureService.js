import axios from 'axios';

class SignatureService {
    async getSessionId(data) {
        return await axios.post(process.env.REACT_APP_API_HOST + `/signature/getSessionId`, data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async SignatureSession() {
        return await axios.get(process.env.REACT_APP_API_HOST + '/signature/')
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async sign(data, type) {
        console.log("comprobante: " + type)
        let url = ''
        switch (type) {
            case 'certificados':
                url = '-certificados'
                break;
            case 'permisos':
                url = '-permisos'
                break;
            case 'vacaciones':
                url = '-vacaciones'
                break;
            case 'amonestaciones':
                url = '-amonestaciones'
                break;
            case 'suspensiones':
                url = '-suspensiones'
                break;
            case 'apercibimientos':
                url = '-apercibimientos'
                break;
            case 'preavisos':
                url = '-preavisos'
                break;
            case 'notificaciones':
                url = '-notificaciones'
                break;
            case 'comprobantes-pago':
                url = '-comprobantes-pago'
                break;
            default:
                break;
        }
        return await axios.post(process.env.REACT_APP_API_HOST + `/signature${url}/sign`, data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async SignAllDoc(pin, userEmail, userProfile) {
        var data = {
            pin: pin,
            user_email: userEmail,
            user_profile: userProfile
        };

        return await axios.post(process.env.REACT_APP_API_HOST + `/signature/signalldocuments`, data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });

    }

    async SignAll(data, type) {

        let url = ''

        switch (type) {
            case 'amonestaciones':
                url = '-amonestaciones'
                break;

            case 'suspensiones':
                url = '-suspensiones'
                break;

            case 'apercibimientos':
                url = '-apercibimientos'
                break;

            case 'preavisos':
                url = '-preavisos'
                break;

            case 'comprobantes-pago':
                url = '-comprobantes-pago'
                break;

            default:
                break;
        }

        return await axios.post(process.env.REACT_APP_API_HOST + `/signature${url}/signall`, data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async signPdf(id, pin) {
        var data = {
            pin: pin,
            id: id
        }
        return await axios.post(process.env.REACT_APP_API_HOST + '/signature/sign-notifcation', data)
        .then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
}

const instance = new SignatureService();

export default instance; 
