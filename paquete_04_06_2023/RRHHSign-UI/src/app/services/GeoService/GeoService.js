import axios from 'axios';

class GeoService {
    /*async getCountry(country_name = '', country_id = 0) {
        const response = await axios.get(
            process.env.REACT_APP_API_HOST + "/geo/cities",
            {
                params: {
                    country_name: country_name,
                    country_id: country_id
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        );

        return response.data.data;
    }*/

    async getRegions(country_id) {
        const response = await axios.get(
            process.env.REACT_APP_API_HOST + "/geo/regions",
            {
                params: {
                    country_id: country_id
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        );

        return response.data.data;
    }

    async getRegionName(region_id) {
        const response = await axios.get(
            process.env.REACT_APP_API_HOST + "/geo/region-name",
            {
                params: {
                    region_id: region_id
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        );
        return response.data.data;
    }

    async getCities(region_id) {
        const response = await axios.get(
            process.env.REACT_APP_API_HOST + "/geo/cities",
            {
                params: {
                    region_id: region_id
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        );

        return response.data.data;
    }

    async getCityName(city_id) {
        const response = await axios.get(
            process.env.REACT_APP_API_HOST + "/geo/city-name",
            {
                params: {
                    city_id: city_id
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        );
        return response.data.data;
    }
}

const instance = new GeoService();

export default instance; 