import '@fake-db'
import React from 'react';
import { FuseAuthorization, FuseLayout, FuseTheme } from '@fuse';
import Provider from 'react-redux/es/components/Provider';
import { Router } from 'react-router-dom';
import jssExtend from 'jss-extend';
import history from '@history';
import { Auth } from './auth';
import store from './store';
import AppContext from './AppContext';
import routes from './fuse-configs/routesConfig';
import { create } from 'jss';
import { StylesProvider, jssPreset, createGenerateClassName } from '@material-ui/styles';
import { StoreProvider } from 'app/react-store/Store';
import { MsalProvider } from "@azure/msal-react";

const jss = create({
    ...jssPreset(),
    plugins: [...jssPreset().plugins, jssExtend()],
    insertionPoint: document.getElementById('jss-insertion-point'),
});

const generateClassName = createGenerateClassName();

const App = ({ instance }) => {
    return (
        <AppContext.Provider
            value={{
                routes
            }}
        >
            <StylesProvider jss={jss} generateClassName={generateClassName}>
                <Provider store={store}>
                    <StoreProvider>
                        <Auth>
                            <Router history={history}>
                                {/*<MsalProvider instance={instance}>*/}
                                    <FuseAuthorization>
                                        <FuseTheme>
                                            <FuseLayout />
                                        </FuseTheme>
                                    </FuseAuthorization>
                                {/*</MsalProvider>*/}
                            </Router>
                        </Auth>
                    </StoreProvider>
                </Provider>
            </StylesProvider>
        </AppContext.Provider>
    );
};

export default App;
