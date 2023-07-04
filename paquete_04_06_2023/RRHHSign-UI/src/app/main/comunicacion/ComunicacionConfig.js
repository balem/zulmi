import React from 'react';

export const ComunicacionConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/comunicacion',
            component: React.lazy(() => import('./Comunicacion'))
        }
    ]
};