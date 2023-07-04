import React from 'react';

export const KudeAbandonoConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-abandono/:id?',
            component: React.lazy(() => import('./KudeAbandono'))
        }
    ]
};
