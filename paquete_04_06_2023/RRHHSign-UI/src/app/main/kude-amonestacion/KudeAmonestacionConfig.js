import React from 'react';

export const KudeAmonestacionConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-amonestacion/:id?',
            component: React.lazy(() => import('./KudeAmonestacion'))
        }
    ]
};
