import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import "./UserGroupList.css";

import EmployeeDataForm from "app/components/EmployeeDataForm/EmployeeDataForm";

import { Store } from "app/react-store/Store";
import UserGroupDataForm from "app/components/UserGroupDataForm/UserGroupDataForm";

function UserGroupList(props) {
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
                    Agregar Grupos / Sucursales
                </Typography>

                <UserGroupDataForm />
            </div>
        </div>
    );
}

export default UserGroupList;
