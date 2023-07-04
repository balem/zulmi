import React from 'react';

export const MantenimientoUsuarios = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth: ['seguridad'],
    routes: [{
        path: '/user-maintenance',
        component: React.lazy(() =>
            import ('./MantenimientoUsuariosList'))
    }]
};