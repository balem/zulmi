import React from 'react';

export const XMLMockListConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director', 'funcionario'],
    routes  : [
        {
            path     : '/documents/:id?',
            component: React.lazy(() => import('./XMLMockList'))
        }
    ]
};