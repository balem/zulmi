import React from 'react';

export const KudeVacacionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-vacaciones/:id?',
            component: React.lazy(() => import('./KudeVacaciones'))
        }
    ]
};
