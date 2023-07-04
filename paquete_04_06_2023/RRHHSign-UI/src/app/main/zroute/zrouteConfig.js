import React from 'react';

export const ZRouteConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director', 'funcionario', 'seguridad'],
    routes  : [
        {
            path     : '/zroute',
            component: React.lazy(() => import('./zroute'))
        }
    ]
};
