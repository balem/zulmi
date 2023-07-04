import axios from 'axios';

class AgentService {
    async getAgents(filter) {
        return await axios.get(
            process.env.REACT_APP_API_HOST + "/agents",
            {
                params: {
                    id: filter.id,
                    name: filter.name,
                    identification: filter.identification,
                    record_start_date: filter.record_start_date,
                    record_end_date: filter.record_end_date,
                    birthday_start_date: filter.birthday_start_date,
                    birthday_end_date: filter.birthday_end_date
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        ).then((response) => {
            return response;
        }).catch((error) => {
            return error.response;
        });

    }

    async delAgent(filter) {
        const response = await axios.delete(
            process.env.REACT_APP_API_HOST + "/agents/del",
            {
                params: {
                    id: filter.id
                },
                headers: { "content-type": "application/x-www-form-urlencoded" }
            }
        );

        return response;
    }
    
    async saveAgent(userData) {
        await axios
            .post(process.env.REACT_APP_API_HOST + "/users/register", userData)
            .then(async userResponse => {
                let responseUserData = userResponse.data.data;
                let userStatus = userResponse.data.status;
                if (userStatus === "success") {
                    let agentData = {
                        name: userData.name,
                        email: userData.email,
                        identification: userData.identification,
                        sex: userData.sex,
                        birthday: userData.selectedDate,
                        user_id: responseUserData.id
                    };
                    await axios
                        .post(
                            process.env.REACT_APP_API_HOST + "/agents/register",
                            agentData
                        )
                        .then(async agentResponse => {
                            let agentData = agentResponse.data.data;
                            let agentStatus = agentResponse.data.status;
                            if (agentStatus === "success") {
                                return [agentStatus, "Usuario registrado com éxito", agentData];
                            }
                        })
                        .catch(async error => {
                            //DEVE EXCLUIR O USUÁRIO INCLUÍDO
                            let userDeleteData = {
                                id: userData.id
                            };
                            await axios
                                .delete(
                                    process.env.REACT_APP_API_HOST +
                                        "/users/del",
                                    { data: userDeleteData }
                                )
                                .then(() => {
                                    return ["warning", "Usuario no guardado", null];
                                })
                                .catch(error => {
                                    let errorMessage = "Erro inesperado";
                                    if (error.response !== undefined)
                                        errorMessage = error.response.data.data;
                                    return ["error", errorMessage, null];
                                });
                        });
                }
            })
            .catch(error => {
                let errorMessage = "Erro inesperado";
                if (error.response !== undefined)
                    errorMessage = error.response.data.data;
                return ["error", errorMessage, null];
            });
    }
}

const instance = new AgentService();

export default instance; 