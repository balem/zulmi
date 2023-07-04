import React from 'react';
//import {authRoles} from '../../auth';

export const VacacionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/vacaciones',
            component: React.lazy(() => import('./Vacaciones'))
        }
    ]
};