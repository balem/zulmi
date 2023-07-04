import React from 'react';

export const LoggingListConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/logging',
            component: React.lazy(() => import('./LoggingList'))
        }
    ]
};