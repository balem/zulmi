import React from 'react';

export const DocumentConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'director', 'funcionario'],
    routes  : [
        {
            path     : '/document',
            component: React.lazy(() => import('./Document'))
        }
    ]
};