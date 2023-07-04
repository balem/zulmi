import axios from 'axios';

class LoggingService {
    async getLogging(filter, email) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/status", {
                params: {
                    ci: filter.identification,
                    periodo: filter.periodo,
                    email: email
                },
                method: "GET"
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });

    }
}

const instance = new LoggingService();

export default instance;