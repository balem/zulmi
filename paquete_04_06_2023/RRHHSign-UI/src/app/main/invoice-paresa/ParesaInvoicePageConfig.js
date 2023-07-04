import React from 'react';

export const ParesaInvoicePageConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/xmlparesa/:id?',
            component: React.lazy(() => import('./ModernInvoicePage'))
        }
    ]
};
