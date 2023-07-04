import React from 'react';
import ControlService from 'app/services/ControlService';

export const AtlasInvoicePageConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/xmlatlas/:id?',
            component: React.lazy(() => import('./ModernInvoicePage'))
        }
    ]
};
