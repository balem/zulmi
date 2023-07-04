import React from 'react';
//import {authRoles} from '../../auth';

export const ListAmonestacionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-amonestaciones',
            component: React.lazy(() => import('./ListAmonestaciones'))
        }
    ]
};