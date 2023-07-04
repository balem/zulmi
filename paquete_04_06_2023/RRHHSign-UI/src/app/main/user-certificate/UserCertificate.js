import { Typography, Grid, Button } from "@material-ui/core";
import React, { useRef, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import "./UserCertificate.css";

import CertificateService from "app/services/CertificateService";
import UploadEmployeeCertificate from "app/components/UploadEmployeeCertificate";
import UserCertificateList from "app/components/UserCertificateList";
import EmployeeService from "app/services/EmployeeService";
import renderIf from "app/main/Utils/renderIf";

var pfcount = 0;

function UserCertificate(props) {
    const user = useSelector(({ auth }) => auth.user);
    const userEmail = user.data.email;;
    const [hasCert, handleHasCert] = useState(false)
    const [employees, handleEmployees] = useState([]);

    async function checkCertificate() {
        const check = await CertificateService.checkCertificate(userEmail)
        if (check !== undefined) {
            if (check.status == 200) {
                handleHasCert(check.data.data.exists)
            }
        }
    }

    async function fetchEmployees() {
        const result = await EmployeeService.getEmployees({
            userEmail: userEmail
        });
        if (result.status === 200) {
            if (result.data.status === "success") {
                handleEmployees(result.data.data);
            } else if (result.data.status === "error") {
                handleEmployees([]);
            } else {
            }
        } else {
            handleEmployees([]);
        }
    }

    function downloadExcel() {

        window.location.href = `${process.env.REACT_APP_API_HOST}/certificate/download`
}
    
    useEffect(() => {
        checkCertificate()
        fetchEmployees()
    }, [])

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h2 mb-24">
                    Certificado del Usuario
                </Typography>

                <UploadEmployeeCertificate hasCert={hasCert} email={userEmail} fetchEmployees={fetchEmployees} />
                {(renderIf(employees.length > 0))(
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={downloadExcel}
                                //disabled={!isContactsFormValid}
                                >
                                    Descargar Excel
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                    <br></br>
                {(renderIf(employees.length > 0))( 
                    <UserCertificateList key={pfcount++} registro={employees}></UserCertificateList>              
                )}
                
            </div>
           
                    
        </div>
    );
}

export default UserCertificate;
