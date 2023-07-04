import React from 'react';

export const KudeEnfermedadesProfesionalesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/kude-enfermedadesprofesionales/:id?',
            component: React.lazy(() => import('./KudeEnfermedadesProfesionales'))
        }
    ]
};
