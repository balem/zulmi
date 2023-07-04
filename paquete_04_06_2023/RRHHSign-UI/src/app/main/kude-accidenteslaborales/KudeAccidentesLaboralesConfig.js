import React from 'react';

export const KudeAccidentesLaboralesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-accidenteslaborales/:id?',
            component: React.lazy(() => import('./KudeAccidentesLaborales'))
        }
    ]
};
