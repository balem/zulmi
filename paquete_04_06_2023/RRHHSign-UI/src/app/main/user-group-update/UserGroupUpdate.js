import { Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./UserGroupUpdate.css";

import { Store } from "app/react-store/Store";
import UserGroupUpdateDataForm from "app/components/UserGroupUpdateDataForm/UserGroupUpdateDataForm";

function UserGroupUpdate(props) {
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
                    Editar Grupo de Usuarios / Sucursales
                </Typography>

                <UserGroupUpdateDataForm id={id} />
            </div>
        </div>
    );
}

export default UserGroupUpdate;
