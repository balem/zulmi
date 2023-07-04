import axios from 'axios';

class ComprobanteService {
    
    async getComprobantesCount(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/comprobante/GetComprobantesCount/${DocumentId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getComprobantes(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/comprobante/GetComprobantes/${DocumentId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getComprobantesForEmployee(DocumentId, EmployeeEmail) {
        //console.log(EmployeeEmail);
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/comprobante/GetComprobantesForEmployee/${DocumentId}/${EmployeeEmail}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getComprobanteById(id) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/comprobante/GetComprobanteById/${id}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getComprobanteDetails(id) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/comprobanteDetails/GetComprobanteDetails/${id}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async deactivateDocument(id, motivo) {
        return await axios.post(`${process.env.REACT_APP_API_HOST}/signature/${id}/deactivate`, {
            motivo_desactivacion: motivo,
        })
    }

}

const instance = new ComprobanteService();

export default instance; 