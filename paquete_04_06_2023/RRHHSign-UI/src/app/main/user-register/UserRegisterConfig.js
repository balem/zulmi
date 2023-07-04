import React from 'react';
//import {authRoles} from '../../auth';

export const UserRegisterConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director'],
    routes  : [
        {
            path     : '/employees',
            component: React.lazy(() => import('./UserRegister'))
        }
    ]
};