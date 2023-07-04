import React from 'react';

export const KudeComprobantePagoConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/xml/:id?',
            component: React.lazy(() => import('./KudeComprobantePago'))
        }
    ]
};
