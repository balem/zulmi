import React from 'react';

export const ComprobantePageConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/comprobante/:id?',
            component: React.lazy(() => import('./ComprobantePage'))
        }
    ]
};
