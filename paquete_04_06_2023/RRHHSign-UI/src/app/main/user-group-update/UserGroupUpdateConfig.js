import React from 'react';
//import {authRoles} from '../../auth';

export const UserGroupUpdateConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/user-group-details/:id',
            component: React.lazy(() => import('./UserGroupUpdate'))
        }
    ]
};