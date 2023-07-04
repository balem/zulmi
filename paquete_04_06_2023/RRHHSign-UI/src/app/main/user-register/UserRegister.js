import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import "./UserRegister.css";

import EmployeeDataForm from "app/components/EmployeeDataForm/EmployeeDataForm";

import { Store } from "app/react-store/Store";

function UserRegister(props) {
    const { state, dispatch } = React.useContext(Store);
    
    let id = props.match.params.id;

    useEffect(() => {
        dispatch({
            type: "SET_PERSON_COMPANY_ID",
            payload: id
        });
        dispatch({
            type: "SET_PERSON_COMPANY_TYPE",
            payload: "agent"
        });
    },[]);
    
    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h2 mb-24">
                    Agregar Persona
                </Typography>

                <EmployeeDataForm />
            </div>
        </div>
    );
}

export default UserRegister;
