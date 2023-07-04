import React from 'react';
//import {authRoles} from '../../auth';

export const ListEnfermedadesProfesionalesConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    //auth : [authRoles.master, authRoles.admin],
    routes  : [
        {
            path     : '/list-enfermedadesprofesionales',
            component: React.lazy(() => import('./ListEnfermedadesProfesionales'))
        }
    ]
};