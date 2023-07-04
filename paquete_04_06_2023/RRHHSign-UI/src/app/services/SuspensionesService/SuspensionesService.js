import axios from 'axios';

class SuspensionesService {

    constructor() {
        //
    }

    async saveSuspension(
        employee_id,
        fecha_inicio,
        fecha_fin,
        suspension_judicial,
        motivo
    ) {
        return await axios.post(
            `${process.env.REACT_APP_API_HOST}/signature-suspensiones/new`,
            {
                employee_id,
                fecha_inicio,
                fecha_fin,
                motivo,
                suspension_judicial,
            }
        )
    }

    async getSuspensiones(data) {
        let params = []
        if (data) {
            if (data.fecha_inicio) {
                params.push(`fecha_inicio=${data.fecha_inicio}`)
            }
            if (data.fecha_fin) {
                params.push(`fecha_fin=${data.fecha_fin}`)
            }
            if (data.user_email) {
                params.push(`user_email=${data.user_email}`)
            }
        }
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-suspensiones` +
            ( params.length > 0 ? '?' + params.join('&') : '' )
        )
    }

    async getSuspensionById(id) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-suspensiones/${id}`
        )
    }

}

const instance = new SuspensionesService()
export default instance