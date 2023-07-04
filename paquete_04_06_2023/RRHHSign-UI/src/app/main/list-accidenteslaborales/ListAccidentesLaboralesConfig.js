import React from 'react';
//import {authRoles} from '../../auth';

export const ListAccidentesLaboralesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-accidenteslaborales',
            component: React.lazy(() => import('./ListAccidentesLaborales'))
        }
    ]
};