import React from 'react';
//import {authRoles} from '../../auth';

export const ListNotificacionesMessagesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-notificaciones-messages/:id',
            component: React.lazy(() => import('./ListNotificacionesMessages'))
        }
    ]
};