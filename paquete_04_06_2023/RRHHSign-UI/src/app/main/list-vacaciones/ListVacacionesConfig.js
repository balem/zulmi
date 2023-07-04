import React from 'react';
//import {authRoles} from '../../auth';

export const ListVacacionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-vacaciones',
            component: React.lazy(() => import('./ListVacaciones'))
        }
    ]
};