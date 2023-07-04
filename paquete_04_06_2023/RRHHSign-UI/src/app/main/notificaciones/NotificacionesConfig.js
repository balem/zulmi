import React from 'react';
//import {authRoles} from '../../auth';

export const NotificacionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/notificaciones',
            component: React.lazy(() => import('./Notificaciones'))
        }
    ]
};