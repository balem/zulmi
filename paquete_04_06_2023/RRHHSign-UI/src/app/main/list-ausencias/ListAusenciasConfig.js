import React from 'react';
//import {authRoles} from '../../auth';

export const ListAusenciasConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-ausencias',
            component: React.lazy(() => import('./ListAusencias'))
        }
    ]
};