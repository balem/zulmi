import React from 'react';
//import {authRoles} from '../../auth';

export const AmonestacionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/amonestaciones',
            component: React.lazy(() => import('./Amonestaciones'))
        }
    ]
};