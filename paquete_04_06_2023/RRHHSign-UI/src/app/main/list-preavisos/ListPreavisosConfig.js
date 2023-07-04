import React from 'react';
//import {authRoles} from '../../auth';

export const ListPreavisosConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-preavisos',
            component: React.lazy(() => import('./ListPreavisos'))
        }
    ]
};