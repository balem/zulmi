import React from 'react';
//import {authRoles} from '../../auth';

export const EmpleadoUpdateConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/employees-details/:id',
            component: React.lazy(() => import('./EmpleadoUpdate'))
        }
    ]
};