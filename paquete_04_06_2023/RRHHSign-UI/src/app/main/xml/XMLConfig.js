import React from 'react';

export const XMLConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/xml_details/:id?',
            component: React.lazy(() => import('./XML'))
        }
    ]
};