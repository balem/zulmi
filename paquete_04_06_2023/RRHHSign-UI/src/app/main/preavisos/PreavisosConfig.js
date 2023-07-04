import React from 'react';
//import {authRoles} from '../../auth';

export const PreavisosConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/preavisos',
            component: React.lazy(() => import('./Preavisos'))
        }
    ]
};