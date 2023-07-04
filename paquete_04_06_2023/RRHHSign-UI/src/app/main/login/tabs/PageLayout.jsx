import React from "react";
import { AppBar } from '@material-ui/core';
import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./SignInButton";

/**
 * Renders the navbar component with a sign-in button if a user is not authenticated
 */
export const PageLayout = (props) => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            <AppBar bg="primary" variant="dark">
                <a className="navbar-brand" href="/">MSAL React Tutorial</a>
                { isAuthenticated ? <span>Signed In</span> : <SignInButton /> }
            </AppBar>
            {props.children}
        </>
    );
};