import React from 'react';
//import {authRoles} from '../../auth';

export const LogsConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director', 'auditor'],
    routes  : [
        {
            path     : '/logs',
            component: React.lazy(() => import('./Logs'))
        }
    ]
};