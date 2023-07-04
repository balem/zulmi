import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import "./PaymentReceipt.css";

import PaymentReceiptDataForm from "./PaymentReceiptDataForm";

import { Store } from "app/react-store/Store";

function PaymentReceipt(props) {
    const { state, dispatch } = React.useContext(Store);
    
    let id = props.match.params.id;

    useEffect(() => {
        dispatch({
            type: "SET_DOC_ID",
            payload: id
        });
    },[]);
    
    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h2 mb-24">
                    Agregar Documento de Recibo de Haberes
                </Typography>

                <PaymentReceiptDataForm />
            </div>
        </div>
    );
}

export default PaymentReceipt;
