import React from 'react';

export const KudePreavisosConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-preavisos/:id?',
            component: React.lazy(() => import('./KudePreavisos'))
        }
    ]
};
