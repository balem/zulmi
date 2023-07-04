import axios from 'axios';

class MessageService {
    async SendReminder(data) {

        return await axios.post(process.env.REACT_APP_API_HOST + "/message/send-reminder", data)
        .then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });

    }

    async SendReminderEmployee(data) {

        return await axios.post(process.env.REACT_APP_API_HOST + "/message/send-reminder-employee", data)
        .then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });

    }
}

const instance = new MessageService();

export default instance; 