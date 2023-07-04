import React from 'react';

export const KudeApercibimientoConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-apercibimiento/:id?',
            component: React.lazy(() => import('./KudeApercibimiento'))
        }
    ]
};
