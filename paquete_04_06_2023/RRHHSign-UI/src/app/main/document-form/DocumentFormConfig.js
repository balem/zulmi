import React from 'react';

export const DocumentFormConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    // auth : ['master', 'rh', 'rh_not_signer', 'director'],
    routes  : [
        {
            path     : '/form/:type/:id',
            component: React.lazy(() => import('./DocumentForm'))
        }
    ]
};