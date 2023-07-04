import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import "./RegisterRequest.css";
import RegisterRequestForm from './RegisterRequestForm'

import { Store } from "app/react-store/Store";

function RegisterRequest(props) {
    const { state, dispatch } = React.useContext(Store);
    
    const type = props.match.params.type;
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
                    Generar solicitud

                    <RegisterRequestForm />
                </Typography>
            </div>
        </div>
    );
}

export default RegisterRequest;
