import React from 'react';
//import {authRoles} from '../../auth';

export const ListPermisosConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-permisos',
            component: React.lazy(() => import('./ListPermisos'))
        }
    ]
};