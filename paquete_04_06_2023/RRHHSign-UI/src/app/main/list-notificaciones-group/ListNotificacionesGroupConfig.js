import React from 'react';
//import {authRoles} from '../../auth';

export const ListNotificacionesGroupConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-notificaciones-group',
            component: React.lazy(() => import('./ListNotificacionesGroup'))
        }
    ]
};