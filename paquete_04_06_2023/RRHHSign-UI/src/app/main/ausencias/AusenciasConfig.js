import React from 'react';
//import {authRoles} from '../../auth';

export const AusenciasConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/ausencias',
            component: React.lazy(() => import('./Ausencias'))
        }
    ]
};