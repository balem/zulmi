import React from 'react';
//import {authRoles} from '../../auth';

export const ListAbandonoConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-abandono',
            component: React.lazy(() => import('./ListAbandono'))
        }
    ]
};