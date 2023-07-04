import React from 'react';
//import {authRoles} from '../../auth';

export const SuspensionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/suspensiones',
            component: React.lazy(() => import('./Suspensiones'))
        }
    ]
};