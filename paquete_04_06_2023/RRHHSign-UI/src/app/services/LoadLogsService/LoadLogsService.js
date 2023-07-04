import { mockEmployees } from '../../main/document-form/MockData';
import axios from 'axios';
import moment from 'moment';

class LoadLogsService {

    constructor() {
        //console.log('Creating LogsService')
    }

    async getLogs(filter) {
        // let start_date = moment(filter.start_date).format('YYYY-MM-DD');
        // let end_date = moment(filter.end_date).format('YYYY-MM-DD');
        if (Object.keys(filter).length > 0) {
            const query = []
            if (filter.dateFrom) {
                query.push(`date_from=${moment(filter.dateFrom).format('YYYY-MM-DD')}`)
            }
            return axios.post(
                process.env.REACT_APP_API_HOST + '/logs/load', filter
            )
        }
    }

    async getDates() {
        return axios.get(
            process.env.REACT_APP_API_HOST + '/logs/dates'
        )
    
    }
    
}

const instance = new LoadLogsService()
export default instance