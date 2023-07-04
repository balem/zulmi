import axios from 'axios';

class PreavisosService {

    constructor() {
        //
    }

    async savePreaviso(
        employee_id,
        fecha_inicio,
        fecha_fin,
        observacion
    ) {
        return await axios.post(
            `${process.env.REACT_APP_API_HOST}/signature-preavisos/new`,
            {
                employee_id,
                fecha_inicio,
                fecha_fin,
                observacion
            }
        )
    }

    async getPreavisos(data) {
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
            `${process.env.REACT_APP_API_HOST}/signature-preavisos` +
            ( params.length > 0 ? '?' + params.join('&') : '' )
        )
    }

    async getPreavisoById(id) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-preavisos/${id}`
        )
    }

}

const instance = new PreavisosService()
export default instance