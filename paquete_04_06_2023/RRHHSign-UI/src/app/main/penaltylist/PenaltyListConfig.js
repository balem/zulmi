import React from 'react';

export const PenaltyListConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/penalty',
            component: React.lazy(() => import('./PenaltyList'))
        }
    ]
};