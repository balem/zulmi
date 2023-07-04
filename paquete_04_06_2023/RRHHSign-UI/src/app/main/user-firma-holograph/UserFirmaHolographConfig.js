import React from 'react';
//import {authRoles} from '../../auth';

export const UserFirmaConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master'],
    routes  : [
        {
            path     : '/user-firma-holograph',
            component: React.lazy(() => import('./UserFirmaHolograph'))
        }
    ]
};