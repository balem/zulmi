import React from 'react';
//import {authRoles} from '../../auth';

export const EmailConfigConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master', 'rh', 'rh_not_signer'],
    routes  : [
        {
            path     : '/email-config/:slug',
            component: React.lazy(() => import('./EmailConfig'))
        }
    ]
};