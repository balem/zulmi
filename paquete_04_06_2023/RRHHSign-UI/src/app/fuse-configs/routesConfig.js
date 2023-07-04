import React from 'react';
import { Redirect } from 'react-router-dom';
import { FuseUtils } from '@fuse';
import { LoginConfig } from 'app/main/login/LoginConfig';
import { LogoutConfig } from 'app/main/logout/LogoutConfig';
import { UserRegisterConfig } from 'app/main/user-register/UserRegisterConfig';
import { DocumentListConfig } from 'app/main/document-list/DocumentListConfig';
import { DocumentReportConfig } from 'app/main/document-report/DocumentReportConfig';
import { XMLMockListConfig } from 'app/main/xml-mocklist/XMLMockListConfig';
import { PaymentReceiptConfig } from 'app/main/payment-receipt/PaymentReceiptConfig';
import { FaqPageConfig } from 'app/main/faq/FaqPageConfig';
//import { DocumentConfig } from 'app/main/document/DocumentConfig';
import { DocumentFormConfig } from 'app/main/document-form/DocumentFormConfig';
import { RequestListConfig } from 'app/main/RequestList/RequestListConfig';
import { RequestRRHHConfig } from 'app/main/RequestRRHH/RequestRRHHConfig';
import { RegisterRequestConfig } from 'app/main/register-request/RegisterRequestConfig';
import { ModernInvoicePageConfig } from 'app/main/invoice/ModernInvoicePageConfig';
import { ParesaInvoicePageConfig } from 'app/main/invoice-paresa/ParesaInvoicePageConfig';
import { HBSAInvoicePageConfig } from 'app/main/invoice-hbsa/HBSAInvoicePageConfig';
import { AtlasInvoicePageConfig } from 'app/main/invoice-atlas/AtlasModernInvoicePageConfig';
import { LDCInvoicePageConfig } from 'app/main/invoice-ldc/LDCModernInvoicePageConfig';
import { XMLConfig } from 'app/main/xml/XMLConfig';

import { AmonestacionesConfig } from 'app/main/amonestaciones/AmonestacionesConfig';
import { ListAmonestacionesConfig } from 'app/main/list-amonestaciones/ListAmonestacionesConfig';
import { AbandonoConfig } from 'app/main/abandono/AbandonoConfig';
import { ListAbandonoConfig } from 'app/main/list-abandono/ListAbandonoConfig';
import { EnfermedadesProfesionalesConfig } from 'app/main/enfermedadesprofesionales/EnfermedadesProfesionalesConfig';
import { ListEnfermedadesProfesionalesConfig } from 'app/main/list-enfermedadesprofesionales/ListEnfermedadesProfesionalesConfig';
import { VacacionesConfig } from 'app/main/vacaciones/VacacionesConfig';
import { ListVacacionesConfig } from 'app/main/list-vacaciones/ListVacacionesConfig';
import { PermisosConfig } from 'app/main/permisos/PermisosConfig';
import { ListPermisosConfig } from 'app/main/list-permisos/ListPermisosConfig';
import { SuspensionesConfig } from 'app/main/suspensiones/SuspensionesConfig';
import { ListSuspensionesConfig } from 'app/main/list-suspensiones/ListSuspensionesConfig';
import { PreavisosConfig } from 'app/main/preavisos/PreavisosConfig';
import { ListPreavisosConfig } from 'app/main/list-preavisos/ListPreavisosConfig';
import { AusenciasConfig } from 'app/main/ausencias/AusenciasConfig';
import { ListAusenciasConfig } from 'app/main/list-ausencias/ListAusenciasConfig';
import { ApercibimientoConfig } from 'app/main/apercibimiento/ApercibimientoConfig';
import { ListApercibimientoConfig } from 'app/main/list-apercibimiento/ListApercibimientoConfig';
import { AccidentesLaboralesConfig } from 'app/main/accidenteslaborales/AccidentesLaboralesConfig';
import { ListAccidentesLaboralesConfig } from 'app/main/list-accidenteslaborales/ListAccidentesLaboralesConfig';
import { KudeAmonestacionConfig } from 'app/main/kude-amonestacion/KudeAmonestacionConfig';
import { KudeAbandonoConfig } from 'app/main/kude-abandono/KudeAbandonoConfig';
import { KudeAccidentesLaboralesConfig } from 'app/main/kude-accidenteslaborales/KudeAccidentesLaboralesConfig';
import { KudeApercibimientoConfig } from 'app/main/kude-apercibimiento/KudeApercibimientoConfig';
import { KudeAusenciasConfig } from 'app/main/kude-ausencias/KudeAusenciasConfig';
import { KudeEnfermedadesProfesionalesConfig } from 'app/main/kude-enfermedadesprofesionales/KudeEnfermedadesProfesionalesConfig';
import { KudePermisosConfig } from 'app/main/kude-permisos/KudePermisosConfig';
import { KudeSuspensionesConfig } from 'app/main/kude-suspensiones/KudeSuspensionesConfig';
import { KudeVacacionesConfig } from 'app/main/kude-vacaciones/KudeVacacionesConfig';
import { KudePreavisosConfig } from 'app/main/kude-preavisos/KudePreavisosConfig';
import { EmpleadoUpdateConfig } from 'app/main/empleado-update/EmpleadoUpdateConfig';
import { EmailConfigConfig } from 'app/main/email-config/EmailConfigConfig';
import { LogsConfig } from 'app/main/logs/LogsConfig';
import { UserGroupListConfig } from 'app/main/user-group-list/UserGroupListConfig';
import { UserGroupUpdateConfig } from 'app/main/user-group-update/UserGroupUpdateConfig';
import { UserCertificateConfig } from 'app/main/user-certificate/UserCertificateConfig';
import { MantenimientoUsuarios } from 'app/main/mantenimiento-usuarios/MantenimientoUsuarios';
//import { UserCertificateListConfig } from 'app/main/user-certificate-list/UserCertificateListConfig';
import { UserFirmaConfig } from 'app/main/user-firma-holograph/UserFirmaHolographConfig';
import { ListNotificacionesConfig } from 'app/main/list-notificaciones/ListNotificacionesConfig';
import { NotificacionesConfig } from 'app/main/notificaciones/NotificacionesConfig';
import { KudeNotificacionConfig } from 'app/main/kude-notificacion/KudeNotificacionConfig';
import { ListNotificacionesMessagesConfig } from 'app/main/list-notificaciones-messages/ListNotificacionesMessagesConfig';
import { ComprobantePageConfig } from 'app/main/comprobante/ComprobantePageConfig';
import { ComunicacionConfig } from 'app/main/comunicacion/ComunicacionConfig';
import { LoggingListConfig } from 'app/main/logginlist/LoggingListConfig';
import { PenaltyListConfig } from 'app/main/penaltylist/PenaltyListConfig';
import { LoadLogsConfig } from 'app/main/load-logs/LoadLogsConfig';
import { DashBoardConfig } from 'app/main/dashboard/DashBoardConfig';
import { ListNotificacionesGroupConfig } from 'app/main/list-notificaciones-group/ListNotificacionesGroupConfig';
import { ZRouteConfig } from 'app/main/zroute/zrouteConfig';

const routeConfigs = [
    LoginConfig,
    LogoutConfig,
    UserRegisterConfig,
    DocumentListConfig,
    DocumentReportConfig,
    XMLMockListConfig,
    PaymentReceiptConfig,
    FaqPageConfig,
    //DocumentConfig,
    RegisterRequestConfig,
    DocumentFormConfig,
    RequestListConfig,
    RequestRRHHConfig,
    XMLConfig,
    ModernInvoicePageConfig,
    AmonestacionesConfig,
    ListAmonestacionesConfig,
    AbandonoConfig,
    ListAbandonoConfig,
    EnfermedadesProfesionalesConfig,
    ListEnfermedadesProfesionalesConfig,
    VacacionesConfig,
    ListVacacionesConfig,
    PermisosConfig,
    ListPermisosConfig,
    SuspensionesConfig,
    ListSuspensionesConfig,
    PreavisosConfig,
    ListPreavisosConfig,
    AusenciasConfig,
    ListAusenciasConfig,
    ApercibimientoConfig,
    ListApercibimientoConfig,
    AccidentesLaboralesConfig,
    ListAccidentesLaboralesConfig,
    KudeAmonestacionConfig,
    KudeAbandonoConfig,
    KudeAccidentesLaboralesConfig,
    KudeApercibimientoConfig,
    KudeAusenciasConfig,
    KudeEnfermedadesProfesionalesConfig,
    KudePermisosConfig,
    KudeSuspensionesConfig,
    KudeVacacionesConfig,
    KudePreavisosConfig,
    EmpleadoUpdateConfig,
    EmailConfigConfig,
    LogsConfig,
    UserGroupListConfig,
    UserGroupUpdateConfig,
    UserCertificateConfig,
    MantenimientoUsuarios,
    //UserCertificateListConfig,
    UserFirmaConfig,
    NotificacionesConfig,
    ListNotificacionesConfig,
    ListNotificacionesMessagesConfig,
    KudeNotificacionConfig,
    ComprobantePageConfig,
    ComunicacionConfig,
    LoggingListConfig,
    PenaltyListConfig,
    LoadLogsConfig,
    ParesaInvoicePageConfig,
    HBSAInvoicePageConfig,
    LDCInvoicePageConfig,
    AtlasInvoicePageConfig,
    DashBoardConfig,
    ListNotificacionesGroupConfig,
    ZRouteConfig
];

const routes = [
    ...FuseUtils.generateRoutesFromConfigs(routeConfigs),
    {
        path: '/',
        component: () => < Redirect to = "/zroute" / >
    },
    {
        component: () => < Redirect to = "/pages/errors/error-404" / >
    }
];

export default routes;