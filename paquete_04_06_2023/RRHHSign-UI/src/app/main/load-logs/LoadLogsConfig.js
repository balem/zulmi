import React from 'react';
//import {authRoles} from '../../auth';

export const LoadLogsConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['auditor', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/loadlogs',
            component: React.lazy(() => import('./LoadLogs'))
        }
    ]
};