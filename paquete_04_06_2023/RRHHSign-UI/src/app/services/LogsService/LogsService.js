import { mockEmployees } from '../../main/document-form/MockData';
import axios from 'axios';
import moment from 'moment';

class LogsService {

    constructor() {
        //console.log('Creating LogsService')
    }

    async createLogs(email) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/logs/create", {
                params: {
                    user: email,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getLogs(filter) {
        // let start_date = moment(filter.start_date).format('YYYY-MM-DD');
        // let end_date = moment(filter.end_date).format('YYYY-MM-DD');
        if (Object.keys(filter).length > 0) {
            const query = []
            if (filter.userId) {
                query.push(`user_id=${filter.userId}`)
            }
            if (filter.dateFrom) {
                query.push(`date_from=${moment(filter.dateFrom).format('YYYY-MM-DD')}`)
            }
            if (filter.dateTo) {
                query.push(`date_to=${moment(filter.dateTo).format('YYYY-MM-DD')}`)
            }
            if (filter.tipolog) {
                query.push(`tipolog=${filter.tipolog}`)
            }
            return axios.get(
                process.env.REACT_APP_API_HOST + `/logs` + (
                    query.length > 0 ? `?${query.join('&')}` : ''
                ),
            )
        }
    }

}

const instance = new LogsService()
export default instance