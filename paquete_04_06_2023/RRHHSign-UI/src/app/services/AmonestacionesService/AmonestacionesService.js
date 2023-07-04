import axios from 'axios';

class AmonestacionesService {

    constructor() {
        //
    }

    async saveAmonestacion(employee_id, fecha_amonestacion, motivo) {
        return await axios.post(
            `${process.env.REACT_APP_API_HOST}/signature-amonestaciones/new`,
            {
                employee_id,
                fecha_amonestacion,
                motivo
            }
        )
    }

    async getAmonestaciones(data) {
        let params = []
        if (data) {
            if (data.fecha) {
                params.push(`fecha_amonestacion=${data.fecha}`)
            }
            if (data.user_email) {
                params.push(`user_email=${data.user_email}`)
            }
        }
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-amonestaciones` +
            ( params.length > 0 ? '?' + params.join('&') : '' )
        )
    }

    async getAmonestacionById(id) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-amonestaciones/${id}`
        )
    }

}

const instance = new AmonestacionesService()
export default instance