import React from 'react';

export const DocumentListConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['rh', 'rh_not_signer', 'director', 'funcionario'],
    routes  : [
        {
            path     : '/document-list',
            component: React.lazy(() => import('./DocumentList'))
        }
    ]
};