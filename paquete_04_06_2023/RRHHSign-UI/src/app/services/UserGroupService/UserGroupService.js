import { mockEmployees } from '../../main/document-form/MockData';
import axios from 'axios';
import moment from 'moment';

class UserGroupService {

    constructor() {
        //console.log('Creating UserGroupService')
    }

    async getGroup() {
        return axios.get(
            process.env.REACT_APP_API_HOST + '/user-group/all',
        ).catch(function (error) {
            console.log(error);
        }
        )
    }

    async getGroups(userEmail) {
        return axios.get(
            process.env.REACT_APP_API_HOST + `/user-group/user_email=${userEmail}`,
        ).catch(function (error) {
            console.log(error);
        })
    }

    async getGroupById(id) {
        return axios.get(
            process.env.REACT_APP_API_HOST + `/user-group/${id}`,
        ).catch(function (error) {
            console.log(error);
        })
    }

    async insertGroup(data) {
        return axios.post(
            process.env.REACT_APP_API_HOST + `/user-group/`,
            data
        ).catch(function (error) {
            console.log(error);
        })
    }

    async updateGroup(data) {
        return axios.post(
            process.env.REACT_APP_API_HOST + `/user-group/update`,
            data
        ).catch(function (error) {
            console.log(error);
        })
    }
    
}

const instance = new UserGroupService()
export default instance