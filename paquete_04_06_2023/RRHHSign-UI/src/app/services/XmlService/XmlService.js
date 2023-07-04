import axios from 'axios';

class XmlService {

     async getRecibosFirmados(DocumentId) {
        return await axios.get(
            //process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByXmlId/${xmlId}`,
            process.env.REACT_APP_API_HOST + "/document/countrecibos", {
                params: {
                    document_id: DocumentId,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getDocuments(xmlId) {
        return await axios.get(
            //process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByXmlId/${xmlId}`,
            process.env.REACT_APP_API_HOST + "/document/getid", {
                params: {
                    id: xmlId,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
    
    async getXmlsFirmado(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/xml/GetXmlsFirmado/${DocumentId}`,
        ).then((response) => {
            return response.data;
        }).catch((error) => {
            return error.response;
        });
    }

    async getXmlsCount(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/xml/GetXmlsCount/${DocumentId}`,
            /*process.env.REACT_APP_API_HOST + "/document/GetXmlsCount", {
                params: {
                    id: DocumentId,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }*/
        ).then((response) => {
            return response.data;
            //return response.data.data;
        }).catch((error) => {
            return error.response;
        });
    }

    async getXmls(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/xml/GetXmls/${DocumentId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getXmlsHeader(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/header?id=${DocumentId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getXmlsForEmployee(DocumentId, EmployeeEmail) {
        //console.log(EmployeeEmail);
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/xml/GetXmlsForEmployee/${DocumentId}/${EmployeeEmail}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getXmlById(id) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/xml/GetXmlById/${id}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getXmlDetails(id) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/xmlDetails/GetXmlDetails/${id}`,
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

    async getRejections(id) {
        return await axios.get(`${process.env.REACT_APP_API_HOST}/signature/${id}/rejections`)
    }

    async addRejection(id, data) {
        return axios.post(`${process.env.REACT_APP_API_HOST}/signature/${id}/rejections`, data)
    }
}

const instance = new XmlService();

export default instance; 
