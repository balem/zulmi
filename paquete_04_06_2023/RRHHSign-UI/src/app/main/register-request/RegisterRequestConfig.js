import React from 'react';
//import {authRoles} from '../../auth';

export const RegisterRequestConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/form/register',
            component: React.lazy(() => import('./RegisterRequest'))
        }
    ]
};