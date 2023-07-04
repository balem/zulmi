import React from 'react';

export const KudeSuspensionesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-suspensiones/:id?',
            component: React.lazy(() => import('./KudeSuspensiones'))
        }
    ]
};
