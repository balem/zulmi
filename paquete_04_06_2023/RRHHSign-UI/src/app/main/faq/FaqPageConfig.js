import React from 'react';

export const FaqPageConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director', 'funcionario', 'auditor', 'seguridad'],
    routes  : [
        {
            path     : '/faq',
            component: React.lazy(() => import('./FaqPage'))
        }
    ]
};
