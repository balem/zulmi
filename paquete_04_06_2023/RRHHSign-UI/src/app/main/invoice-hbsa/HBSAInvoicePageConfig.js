import React from 'react';

export const HBSAInvoicePageConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/xmlhbsa/:id?',
            component: React.lazy(() => import('./ModernInvoicePage'))
        }
    ]
};
