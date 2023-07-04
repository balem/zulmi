import React from 'react';
//import {authRoles} from '../../auth';

export const EnfermedadesProfesionalesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/enfermedadesprofesionales',
            component: React.lazy(() => import('./EnfermedadesProfesionales'))
        }
    ]
};