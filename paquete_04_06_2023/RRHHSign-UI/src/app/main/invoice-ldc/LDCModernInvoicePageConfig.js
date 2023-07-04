import React from 'react';
import ControlService from 'app/services/ControlService';

export const LDCInvoicePageConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/xmlldc/:id?',
            component: React.lazy(() => import('./ModernInvoicePage'))
        }
    ]
};
