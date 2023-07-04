import React from 'react';
//import {authRoles} from '../../auth';

export const UserCertificateConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth : ['master'],
    routes  : [
        {
            path     : '/user-certificate',
            component: React.lazy(() => import('./UserCertificate'))
        }
    ]
};