const navigationConfig = [{
    'id': 'applications',
    'title': 'Menú',
    'type': 'group',
    'icon': 'apps',
    'children': [{
            'id': 'dashboard',
            'title': 'DashBoard',
            'type': 'item',
            'icon': 'chat',
            'url': '/dashboard',
            'auth': ['master', 'rh', 'rh_not_signer', 'director']
        },
        {
            'id': 'user-groups',
            'title': 'Sucursales',
            'type': 'item',
            'icon': 'person',
            'url': '/user-groups',
            'auth': ['master', 'rh', 'rh_not_signer']
        },
        {
            'id': 'employees',
            'title': 'Empleados',
            'type': 'item',
            'icon': 'person',
            'url': '/employees',
            'auth': ['master', 'rh', 'rh_not_signer']
        },
        {
            'id': 'salary',
            'title': 'Documentos de Haberes',
            'type': 'collapse',
            'icon': 'money',
            'auth': ['rh', 'rh_not_signer', 'director', 'funcionario'],
            'children': [{
                    'id': 'payment-receipts',
                    'title': 'Agregar Recibo',
                    'type': 'item',
                    'icon': 'insert_drive_file',
                    'url': '/payment-receipt',
                    'auth': ['rh', 'rh_not_signer']
                },
                {
                    'id': 'document-list',
                    'title': 'Recibos de Haberes',
                    'type': 'item',
                    'icon': 'document-list',
                    'url': '/document-list',
                    'auth': ['master', 'rh', 'rh_not_signer', 'director', 'funcionario']
                },
                {
                    'id': 'document-report',
                    'title': 'Control de Recibos',
                    'type': 'item',
                    'icon': 'document-list',
                    'url': '/document-report',
                    'auth': ['rh', 'rh_not_signer']
                },
                {
                    'id': 'load-logs',
                    'title': 'Log de Errores',
                    'type': 'item',
                    'icon': 'help_outline',
                    'url': '/loadlogs',
                    'auth': ['master', 'auditor', 'rh', 'rh_not_signer']
                },
                /*{
                    'id'   : 'documents',
                    'title': 'Documentos',
                    'type' : 'item',
                    'icon' : 'insert_drive_file',
                    'url'  : '/documents',
                    'auth' : ['master', 'rh', 'rh_not_signer', 'director', 'funcionario']
                }*/
            ]
        },
        /*{
            'id': 'chat',
            'title': 'Notificaciones',
            'type': 'collapse',
            'icon': 'chat',
            'auth': ['master', 'rh', 'rh_not_signer', 'director', 'funcionario'],
            'children': [{
                    'id': 'Listar Notificaciones',
                    'title': 'Listar Notificaciones',
                    'type': 'item',
                    'icon': 'document-list',
                    'url': '/list-notificaciones',
                    'auth': ['funcionario']
                },
                {
                    'id': 'Listar Notificaciones',
                    'title': 'Listar Notificaciones',
                    'type': 'item',
                    'icon': 'document-list',
                    'url': '/list-notificaciones-group',
                    'auth': ['master', 'rh', 'rh_not_signer', 'director']
                },
                {
                    'id': 'Registrar Notificacion',
                    'title': 'Registrar Notificacion',
                    'type': 'item',
                    'icon': 'document-list',
                    'url': '/notificaciones',
                    'auth': ['master', 'rh', 'rh_not_signer', 'director']
                },
            ]
        },*/
        {
            'id': 'comunications',
            'title': 'Comunicaciones',
            'type': 'collapse',
            'icon': 'money',
            'auth': process.env.REACT_APP_HIDE_COMUNICATIONS ? [] : [],
            'children': [{
                    'id': 'AccidentesLaborales',
                    'title': 'Accidentes Laborales',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-accidenteslaborales'
                },
                {
                    'id': 'Listar Amonestaciones',
                    'title': 'Listar Amonestaciones',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-amonestaciones'
                },
                {
                    'id': 'Registrar Amonestación',
                    'title': 'Registrar Amonestación',
                    'type': 'item',
                    'icon': 'person',
                    'auth': ['rh', 'rh_not_signer'],
                    'url': '/amonestaciones'
                },
                {
                    'id': 'Abandono',
                    'title': 'Abandono',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-abandono'
                },
                {
                    'id': 'EnfermedadesProfesionales',
                    'title': 'Enfermedades Profesionales',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-enfermedadesprofesionales'
                },
                {
                    'id': 'Vacaciones',
                    'title': 'Vacaciones',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-vacaciones'
                },
                {
                    'id': 'Permisos',
                    'title': 'Permisos',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-permisos'
                },
                {
                    'id': 'Listar Suspensiones',
                    'title': 'Listar Suspensiones',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-suspensiones'
                },
                {
                    'id': 'Registrar Suspensión',
                    'title': 'Registrar Suspensión',
                    'type': 'item',
                    'icon': 'person',
                    'auth': ['rh', 'rh_not_signer'],
                    'url': '/suspensiones'
                },
                {
                    'id': 'Listar Preavisos',
                    'title': 'Listar Preavisos',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-preavisos'
                },
                {
                    'id': 'Registrar Preaviso',
                    'title': 'Registrar Preaviso',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/preavisos'
                },
                {
                    'id': 'Ausencias',
                    'title': 'Ausencias',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-ausencias'
                },
                {
                    'id': 'Apercibimiento',
                    'title': 'Apercibimiento',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-apercibimiento'
                },

                {
                    'id': 'Listar Apercibimientos',
                    'title': 'Listar Apercibimientos',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/list-apercibimiento'
                },
                {
                    'id': 'Registrar Apercibimiento',
                    'title': 'Registrar Apercibimiento',
                    'type': 'item',
                    'icon': 'person',
                    'url': '/apercibimiento'
                },
                {
                    'id': 'RegisterRequest',
                    'title': 'Registrar solicitud',
                    'type': 'item',
                    'icon': 'lock',
                    'url': '/form/register',
                    'auth': ['master', 'rh', 'rh_not_signer', 'director', 'funcionario']
                },
                {
                    'id': 'RequestList',
                    'title': 'Lista de solicitudes',
                    'type': 'item',
                    'icon': 'lock',
                    'url': '/RequestList',
                    'auth': ['master', 'rh', 'rh_not_signer', 'director', 'funcionario']
                },
                {
                    'id': 'RequestRRHH',
                    'title': 'Lista de solicitudes RRHH',
                    'type': 'item',
                    'icon': 'lock',
                    'url': '/RequestRRHH',
                    'auth': ['master', 'rh', 'rh_not_signer']
                }
            ]
        },
        /*{
            'id': 'certificates',
            'title': 'Certificado del Usuario',
            'type': 'collapse',
            'icon': 'group',
            'auth': ['master'],
            'children': [{
                    'id': 'user-certificate',
                    'title': 'Importar Certificado',
                    'type': 'item',
                    'icon': 'addcircle',
                    'auth': ['master'],
                    'url': '/user-certificate',
                },
                {
                    'id': 'user-certificate-list',
                    'title': 'Lista de Certificados',
                    'type': 'item',
                    'icon': 'list',
                    'auth': ['master'],
                    'url': '/user-certificate-list',
                },


            ]
        },*/
        {
            'id': 'user-certificate',
            'title': 'Certificado del Usuario',
            'type': 'item',
            'icon': 'help_outline',
            'auth': ['master'],
            'url': '/user-certificate',
        },
        {
            'id': 'user-maintenance',
            'title': 'Mantenimiento de Usuarios',
            'type': 'item',
            'icon': 'build',
            'auth': ['seguridad'],
            'url': '/user-maintenance',
        },
        {
            'id': 'user-firma-holograph',
            'title': 'Firma Holografa',
            'type': 'item',
            'icon': 'person',
            'auth': ['master'],
            'url': '/user-firma-holograph',
        },
        {
            'id': 'faq',
            'title': 'FAQ',
            'type': 'item',
            'icon': 'help_outline',
            'url': '/faq'
        },
        {
            'id': 'login-component',
            'title': 'Iniciar Sesión',
            'type': 'item',
            'icon': 'lock',
            'url': '/login',
            'auth': ['guest']
        },
        {
            'id': 'email-config',
            'title': 'Configuración de E-mail',
            'type': 'collapse',
            'icon': 'email',
            'auth': ['master', 'rh', 'rh_not_signer'],
            'children': [{
                    'id': 'notification-reminder-director',
                    'title': 'Notificación Director',
                    'type': 'item',
                    'icon': 'cog',
                    'url': '/email-config/notification-reminder-director',
                    'auth': ['master', 'rh', 'rh_not_signer']
                },
                {
                    'id': 'notification-reminder-employee',
                    'title': 'Notificación Empleado',
                    'type': 'item',
                    'icon': 'cog',
                    'url': '/email-config/notification-reminder-employee',
                    'auth': ['master', 'rh', 'rh_not_signer']
                },
            ]
        },
        {
            'id': 'logs',
            'title': 'Log de Acciones',
            'type': 'item',
            'icon': 'help_outline',
            'url': '/logs',
            'auth': ['master', 'auditor', 'rh', 'rh_not_signer']
        },
        {
            'id': 'comunicacion',
            'title': 'Comunicación MTESS',
            'type': 'item',
            'icon': 'email',
            'url': '/comunicacion',
            'auth': ['rh', 'rh_not_signer']
        },
        {
            'id': 'mtess-verify',
            'title': 'Consultas al MTESS',
            'type': 'collapse',
            'icon': 'help_outline',
            'auth': ['master', 'rh', 'rh_not_signer'],
            'children': [{
                    'id': 'request-hash',
                    'title': 'Verificación de inserción',
                    'type': 'item',
                    'icon': 'help_outline',
                    'url': '/logging',
                    'auth': ['master', 'rh', 'rh_not_signer']
                },
                {
                    'id': 'penalty',
                    'title': 'Consulta de multas',
                    'type': 'item',
                    'icon': 'help_outline',
                    'url': '/penalty',
                    'auth': ['master', 'rh', 'rh_not_signer']
                },
            ]
        },
    ]
}];

export default navigationConfig;