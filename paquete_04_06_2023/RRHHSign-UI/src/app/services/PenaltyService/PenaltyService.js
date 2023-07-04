import axios from 'axios';

class PenaltyService {
    async getPenalty(filter, email) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/status/multas", {
                params: {
                    ipsPatronal: filter.ipsPatronal,
                    ci: filter.identification,
                    email: email
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
}
const instance = new PenaltyService();

export default instance;