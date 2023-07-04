import React from 'react';
//import {authRoles} from '../../auth';

export const RequestListConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/RequestList',
            component: React.lazy(() => import('./RequestList'))
        }
    ]
};