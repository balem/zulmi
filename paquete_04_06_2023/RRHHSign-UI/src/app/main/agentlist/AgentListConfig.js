import React from 'react';
//import {authRoles} from '../../auth';

export const AgentListConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/agents',
            component: React.lazy(() => import('./AgentList'))
        }
    ]
};