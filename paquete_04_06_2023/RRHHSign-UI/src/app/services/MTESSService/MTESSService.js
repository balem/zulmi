import axios from 'axios';

class MTESSService {

    async LogXmlMtess(email, data, xml_id) {
        var data = {
            email: email,
            xml: xml_id,
            message: data
        };

        return await axios.post(process.env.REACT_APP_API_HOST + "/sendmtess/logXml", data)
            .then((response) => {
                return response;
            })
    }

    async LogDocumentMtess(email, data, documentId) {
        var data = {
            email: email,
            message: data,
            document: documentId
        };

        return await axios.post(process.env.REACT_APP_API_HOST + "/sendmtess/logDocument", data)
            .then((response) => {
                return response;
            })
    }

    async sendXMLToMTESS(data) {

        /**
         * Crear post por documento
         */
        return await axios.post(process.env.REACT_APP_API_HOST + "/sendmtess/SendXMLToMTESS", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async sendDocumentXMLsToMTESS(data) {
        /**
         * Crear post por grupo
         */
        return await axios.post(process.env.REACT_APP_API_HOST + "/sendmtess/SendDocumentXMLsToMTESS", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async sendAmonestacionToMTESS(xmlId) {
        var data = {
            id: xmlId
        };
        /**
         * Crear post por documento
         */
        return await axios.post(process.env.REACT_APP_DOTNET_API_HOST + "/api/mtess/SendAmonestacionToMTESS", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async sendSuspensionToMTESS(xmlId) {
        var data = {
            id: xmlId
        };
        /**
         * Crear post por documento
         */
        return await axios.post(process.env.REACT_APP_DOTNET_API_HOST + "/api/mtess/SendSuspensionToMTESS", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async sendApercibimientoToMTESS(xmlId) {
        var data = {
            id: xmlId
        };
        /**
         * Crear post por documento
         */
        return await axios.post(process.env.REACT_APP_DOTNET_API_HOST + "/api/mtess/SendApercibimientoToMTESS", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }

    async sendPreavisoToMTESS(xmlId) {
        var data = {
            id: xmlId
        };
        /**
         * Crear post por documento
         */
        return await axios.post(process.env.REACT_APP_DOTNET_API_HOST + "/api/mtess/SendPreavisoToMTESS", data)
            .then((response) => {
                return response;
            }).catch((error) => {
                return error.response;
            });
    }
}

const instance = new MTESSService();

export default instance;