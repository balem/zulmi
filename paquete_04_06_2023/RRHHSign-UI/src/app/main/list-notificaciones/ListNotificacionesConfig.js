import React from 'react';
//import {authRoles} from '../../auth';

export const ListNotificacionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-notificaciones',
            component: React.lazy(() => import('./ListNotificaciones'))
        }
    ]
};