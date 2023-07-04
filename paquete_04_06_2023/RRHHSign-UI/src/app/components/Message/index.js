import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import React from "react";

export default function Message() {
    const dispatch = useDispatch();

    function send(type = "null", message = "") {
        dispatch(
            Actions.showMessage({
                message: message,
                autoHideDuration: 6000, //ms
                anchorOrigin: {
                    vertical: "top", //top bottom
                    horizontal: "center" //left center right
                },
                variant: type //success error info warning null
            })
        );
    }

    return (
        <div></div>
    );
}
