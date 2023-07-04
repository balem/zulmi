import React from 'react';

export const KudeAusenciasConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-ausencias/:id?',
            component: React.lazy(() => import('./KudeAusencias'))
        }
    ]
};
