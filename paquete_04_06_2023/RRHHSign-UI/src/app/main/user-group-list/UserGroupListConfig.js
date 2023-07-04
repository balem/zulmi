import React from 'react';
//import {authRoles} from '../../auth';

export const UserGroupListConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer', 'director'],
    routes  : [
        {
            path     : '/user-groups',
            component: React.lazy(() => import('./UserGroupList'))
        }
    ]
};