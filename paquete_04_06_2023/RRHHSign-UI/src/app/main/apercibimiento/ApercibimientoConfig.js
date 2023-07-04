import React from 'react';
//import {authRoles} from '../../auth';

export const ApercibimientoConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/apercibimiento',
            component: React.lazy(() => import('./Apercibimiento'))
        }
    ]
};