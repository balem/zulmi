import { Typography } from "@material-ui/core";
import React, { useRef, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import "./UserFirmaHolograph.css";

import { Store } from "app/react-store/Store";
import CertificateService from "app/services/CertificateService";
import UploadEmployeeFirmaHolograph from "app/components/UploadEmployeeFirmaHolograph";

function UserCertificate(props) {
    const user = useSelector(({ auth }) => auth.user);
    const userEmail = user.data.email;;
    const [hasCert, handleHasCert] = useState(false)

    useEffect(() => {
        async function checkCertificate() {
            const check = await CertificateService.checkCertificate(userEmail)
            if (check !== undefined) {
                if (check.status == 200) {
                    handleHasCert(check.data.data.exists)
                }
            }
        }

        checkCertificate()
    }, [])
    
    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h2 mb-24">
                    Firma del Usuario
                </Typography>

                <UploadEmployeeFirmaHolograph hasCert={hasCert} email={userEmail} />
            </div>
        </div>
    );
}

export default UserCertificate;
