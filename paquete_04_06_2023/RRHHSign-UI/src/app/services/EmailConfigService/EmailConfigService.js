import axios from 'axios';

class EmailConfigService {
    async getConfigs() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/email-config"
        )
    }

    async getConfig(slug) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/email-config/${slug}`
        )
    }

    async updateConfig(slug, data) {
        return await axios.post(
            process.env.REACT_APP_API_HOST + `/email-config/${slug}`,
            data
        )
    }
    
}

const instance = new EmailConfigService();

export default instance; 