import { Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./EmpleadoUpdate.css";

import EmployeeDataForm from "app/components/EmployeeDataForm/EmployeeDataForm";

import { Store } from "app/react-store/Store";
import EmployeeUpdateDataForm from "app/components/EmployeeUpdateDataForm/EmployeeUpdateDataForm";

function EmpleadoUpdate(props) {
    const { state, dispatch } = React.useContext(Store);
    
    const [id, handleId] = useState(props.match.params.id)
    
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
                    Editar Persona
                </Typography>

                <EmployeeUpdateDataForm id={id} />
            </div>
        </div>
    );
}

export default EmpleadoUpdate;
