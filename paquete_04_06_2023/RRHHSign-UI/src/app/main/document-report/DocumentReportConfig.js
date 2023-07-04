import React from 'react';

export const DocumentReportConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/document-report',
            component: React.lazy(() => import('./DocumentReport'))
        }
    ]
};