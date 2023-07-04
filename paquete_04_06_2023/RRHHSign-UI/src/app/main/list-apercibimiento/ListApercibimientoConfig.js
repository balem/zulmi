import React from 'react';
//import {authRoles} from '../../auth';

export const ListApercibimientoConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-apercibimiento',
            component: React.lazy(() => import('./ListApercibimiento'))
        }
    ]
};