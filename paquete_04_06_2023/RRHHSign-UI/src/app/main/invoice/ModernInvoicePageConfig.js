import React from 'react';
import ControlService from 'app/services/ControlService';

export const ModernInvoicePageConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director', 'funcionario'],
    routes  : [
        {
            path     : '/xml/:id?',
            component: React.lazy(() => import('./ModernInvoicePage'))
        }
    ]
};
