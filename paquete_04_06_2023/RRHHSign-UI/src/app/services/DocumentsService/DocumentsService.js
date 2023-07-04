import { mockEmployees } from '../../main/document-form/MockData';
import axios from 'axios';
import moment from 'moment';

const KEY = 'savedDocuments'
const restored = localStorage.getItem(KEY)

class DocumentsService {

    constructor() {
        //console.log('Creating DocumentsService')
    }

    documents = restored ? JSON.parse(restored) : [{
        id: 1,
        userId: 2,
        desde: "30/07/2019",
        hasta: "31/12/2019",
        observacion: "-",
        type: "vacations",
        status: "Pendiente"
    }]

    async getXmlsForEmployeeSignature(id) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/document/xmlsSignatureStatus", {
                params: {
                    xml_id: id,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getDocumentsReport(filter) {

        if (Object.keys(filter).length > 0) {
            const query = []
            if (filter.empleado) {
                query.push(`empleado=${filter.empleado}`)
            }
            if (filter.statusdir) {
                query.push(`statusdir=${filter.statusdir}`)
            }
            if (filter.statusemp) {
                query.push(`statusemp=${filter.statusemp}`)
            }
            if (filter.identification) {
                query.push(`identification=${filter.identification}`)
            }
            if (filter.start_date) {
                query.push(`date_from=${moment(filter.start_date).format('YYYY-MM-DD')}`)
            }
            if (filter.end_date) {
                query.push(`date_to=${moment(filter.end_date).format('YYYY-MM-DD')}`)
            }
            if (filter.sucursal) {
                query.push(`sucursal=${filter.sucursal}`)
            }
            if (filter.tipo) {
                query.push(`tipo=${filter.tipo}`)
            }
            return axios.get(
                process.env.REACT_APP_API_HOST + `/document/report` + (
                    query.length > 0 ? `?${query.join('&')}` : ''
                ),
            )
        }
    }


    async getDocuments(filter) {
        let start_date = moment(filter.start_date).format('YYYY-MM-DD');
        let end_date = moment(filter.end_date).format('YYYY-MM-DD');

        if (filter.status === 'T') {
            filter.status = '';
        }

        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/document/${start_date}/${end_date}/${filter.status === '' ? 'ALL' : filter.status}/${filter.creator === '' ? 'ALL' : filter.creator}/${filter.group === '' ? 'ALL' : filter.group}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async GetDocumentsForEmployee(filter) {
        let start_date = moment(filter.start_date).format('YYYY-MM-DD');
        let end_date = moment(filter.end_date).format('YYYY-MM-DD');

        if (filter.status === 'T') {
            filter.status = 'ALL';
        }

        var queryString = process.env.REACT_APP_DOTNET_API_HOST + `/api/document/GetDocumentsForEmployee/${filter.employeeId}/${start_date}/${end_date}/${filter.status === '' ? 'ALL' : filter.status}/${filter.creator === '' ? 'ALL' : filter.creator}/${filter.group === '' ? 'ALL' : filter.group}`;

        console.log("QSTRING: " + queryString);

        return await axios.get(
            queryString,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getDocumentById(id) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/document/GetDocumentById/${id}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async GetDocumentCountByStatus(status, employeeId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/document/GetDocumentCountByStatus/${status}` +
            (employeeId ? `/${employeeId}` : ''),
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async deactivateDocument(id, motivo, userMail) {
        return await axios.post(`${process.env.REACT_APP_API_HOST}/document/${id}/deactivate`, {
            motivo_desactivacion: motivo,
            creator: userMail
        })
    }

    async downloadFiles(ids) {
        return await axios.get(this.downloadFilesUrl(ids))
    }

    downloadFilesUrl(ids) {
        return `${process.env.REACT_APP_API_HOST}/document/download?` +
            (ids.map(id => `id[]=${id}`).join('&'))
    }

    getDocumentsByStatus(status) {
        return this.documents.filter(document => document.status === status)
    }

    getDocumentsByStatusAndUser(status, userId) {
        return this.documents.filter(document => document.status === status && document.userId === userId)
    }

    getDocumentsByUserId(userId) {
        return this.documents.filter(document => document.userId === userId)
    }

    addDocument(document) {
        document.id = this.documents.length + 1
        document.userId = mockEmployees[1].id
        this.documents.push(document)
        localStorage.setItem(KEY, JSON.stringify(this.documents))
    }

    getDocument(id) {
        return this.documents.find(document => document.id === id)
    }

    updateDocument(id, document) {
        const savedDocument = this.getDocument(id)
        const index = this.documents.indexOf(savedDocument)
        this.documents[index] = document
        localStorage.setItem(KEY, JSON.stringify(this.documents))
    }

    async getCantDoc() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/cantdoc`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantDocCom() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/cantdoccom`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantDocEnp() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/cantdocenp`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantDocPen() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/cantdocpen`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantXML() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/xml`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantXMLFir() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/xmlfir`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantXMLNoFir() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/xmlnofir`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantXMLMTESS() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/xmlmtess`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async sendMail() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/document/sendrecordmail`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
}

const instance = new DocumentsService()
export default instance