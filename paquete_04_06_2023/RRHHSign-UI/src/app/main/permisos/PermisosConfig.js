import React from 'react';
//import {authRoles} from '../../auth';

export const PermisosConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/permisos',
            component: React.lazy(() => import('./Permisos'))
        }
    ]
};