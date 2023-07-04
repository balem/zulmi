import axios from 'axios';

class EmployeeService {

    async desactivate(employeeData) {
        return axios
            .post(process.env.REACT_APP_API_HOST + "/employees/desactivate", employeeData);
    }

    async getCargos() {
        return axios.get(
            process.env.REACT_APP_API_HOST + '/employees/cargos',
        ).catch(function(error) {
            console.log(error);
        })
    }

    async getDepart() {
        return axios.get(
            process.env.REACT_APP_API_HOST + '/employees/depart',
        ).catch(function(error) {
            console.log(error);
        })
    }

    async getEmployees(filter) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/employees/", {
                params: {
                    profile_slug: 'funcionario',
                    user_email: filter.userEmail
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async delEmployee(filter) {
        const response = await axios.delete(
                process.env.REACT_APP_API_HOST + "/employees/del", {
                    params: {
                        id: filter.id
                    },
                    headers: { "content-type": "application/x-www-form-urlencoded" }
                }
            )
            .then(response => {
                return [response.data.status, response.data.message];
            })
            .catch(error => {
                let errorMessage = "Erro inesperado";
                if (error.response !== undefined)
                    errorMessage = error.response.data.message;
                return ["error", errorMessage];
            });
    }

    async getEmployeesCount(DocumentId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeesCount/${DocumentId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeById(id) {
        return await axios.get(
            //process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeById/${id}`,
            process.env.REACT_APP_API_HOST + "/employees/actualizar", {
                params: {
                    id: id,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeByXmlId(xmlId) {
        return await axios.get(
            //process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByXmlId/${xmlId}`,
            process.env.REACT_APP_API_HOST + "/employees/xmlid", {
                params: {
                    id: xmlId,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeByComprobanteId(xmlId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByComprobanteId/${xmlId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeByAmonestacionId(xmlId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByAmonestacionId/${xmlId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeBySuspensionId(xmlId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeBySuspensionId/${xmlId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeByApercibimientoId(xmlId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByApercibimientoId/${xmlId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeByPreavisoId(xmlId) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByPreavisoId/${xmlId}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeByUserEmail(email) {
        return await axios.get(
            process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeByUserEmail/${email}`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeWithUserByEmail(email) {
        return await axios.get(
            //process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeWithUserByEmail/${email}`,
            process.env.REACT_APP_API_HOST + "/employees/group", {
                params: {
                    email: email,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getEmployeeWithUserByEmailUpdate(email) {
        return await axios.get(
            //process.env.REACT_APP_DOTNET_API_HOST + `/api/Employee/GetEmployeeWithUserByEmail/${email}`,
            process.env.REACT_APP_API_HOST + "/employees/group", {
                params: {
                    email: email,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getDirector(email) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/employees/director", {
                params: {
                    email: email,
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            var director = {
                name: ""
            }

            //console.log("DIRECTOR DATA: " + JSON.stringify(response.data));

            if (response.status === 200) {
                director.name = response.data.data[0].nombres + " " + response.data.data[0].apellidos;
            }

            return director;
        }).catch((error) => {
            return error.response;
        });
    }

    async getSucursal() {
        return axios
            .get(process.env.REACT_APP_API_HOST + "/employees/sucursal");
    }

    async update(employeeData) {
        return axios
            .post(process.env.REACT_APP_API_HOST + "/employees/update", employeeData);
    }

    async forgotPassword(email) {
        return await axios.post(
            process.env.REACT_APP_API_HOST + "/employees/forgot-password", {
                email,
            }
        )
    }

    async getEmployeeGroup(value) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/user-group/group/" + value,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantEmp() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/employees/cantemp`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantEmpCert() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/employees/cantempcert`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }

    async getCantEmpCertCor() {
        return await axios.get(
            process.env.REACT_APP_API_HOST + `/employees/cantempcertcor`,
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });
    }
}
const instance = new EmployeeService();

export default instance;