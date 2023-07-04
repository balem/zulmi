import React from 'react';

export const DashBoardConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director'],
    routes  : [
        {
            path     : '/dashboard',
            component: React.lazy(() => import('./DashBoard'))
        }
    ]
};
