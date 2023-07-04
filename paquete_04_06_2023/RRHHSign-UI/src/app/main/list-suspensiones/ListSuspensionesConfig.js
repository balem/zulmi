import React from 'react';
//import {authRoles} from '../../auth';

export const ListSuspensionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-suspensiones',
            component: React.lazy(() => import('./ListSuspensiones'))
        }
    ]
};