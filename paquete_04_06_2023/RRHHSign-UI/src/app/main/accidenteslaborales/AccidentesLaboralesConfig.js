import React from 'react';
//import {authRoles} from '../../auth';

export const AccidentesLaboralesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/accidenteslaborales',
            component: React.lazy(() => import('./AccidentesLaborales'))
        }
    ]
};