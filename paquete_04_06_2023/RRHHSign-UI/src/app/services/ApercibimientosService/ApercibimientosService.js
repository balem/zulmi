import axios from 'axios';

class ApercibimientosService {

    constructor() {
        //
    }

    async saveApercibimiento(
        employee_id,
        fecha_apercibimiento,
        motivo
    ) {
        return await axios.post(
            `${process.env.REACT_APP_API_HOST}/signature-apercibimientos/new`,
            {
                employee_id,
                fecha_apercibimiento,
                motivo,
            }
        )
    }

    async getApercibimientos(data) {
        let params = []
        if (data) {
            if (data.fecha_apercibimiento) {
                params.push(`fecha_apercibimiento=${data.fecha_apercibimiento}`)
            }
            
            if (data.user_email) {
                params.push(`user_email=${data.user_email}`)
            }
        }
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-apercibimientos` +
            ( params.length > 0 ? '?' + params.join('&') : '' )
        )
    }

    async getApercibimientoById(id) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-apercibimientos/${id}`
        )
    }

}

const instance = new ApercibimientosService()
export default instance