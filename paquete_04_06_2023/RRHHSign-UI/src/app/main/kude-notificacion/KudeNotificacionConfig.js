import React from 'react';

export const KudeNotificacionConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-notificaciones/:id?',
            component: React.lazy(() => import('./KudeNotificacion'))
        }
    ]
};
