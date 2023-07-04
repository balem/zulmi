import React from 'react';

export const KudePermisosConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-permisos/:id?',
            component: React.lazy(() => import('./KudePermisos'))
        }
    ]
};
