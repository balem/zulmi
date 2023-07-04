import { Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./EmailConfig.css";

import EmployeeDataForm from "app/components/EmployeeDataForm/EmployeeDataForm";

import { Store } from "app/react-store/Store";
import EmployeeUpdateDataForm from "app/components/EmployeeUpdateDataForm/EmployeeUpdateDataForm";
import EmailConfigDataForm from "app/components/EmailConfigDataForm/EmailConfigDataForm";

function EmailConfig(props) {
    const { state, dispatch } = React.useContext(Store);
    
    const [slug, handleSlug] = useState(props.match.params.slug)
    
    useEffect(() => {
        handleSlug(props.match.params.slug)
    }, [props.match.params.slug])

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h2 mb-24">
                    Editar Configuración de Email
                </Typography>

                <EmailConfigDataForm slug={slug} />
            </div>
        </div>
    );
}

export default EmailConfig;
