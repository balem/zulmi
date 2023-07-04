import React from 'react';
//import {authRoles} from '../../auth';

export const AbandonoConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/abandono',
            component: React.lazy(() => import('./Abandono'))
        }
    ]
};