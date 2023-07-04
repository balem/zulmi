import React from 'react';

export const PaymentReceiptConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/payment-receipt/:id?',
            component: React.lazy(() => import('./PaymentReceipt'))
        }
    ]
};