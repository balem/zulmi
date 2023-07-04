import axios from 'axios';

class NotificacionesService {

    constructor() {
        //
    }

    async saveNotificacion(user_group_id, fecha, titulo, texto) {
        return await axios.post(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/new`, {
                user_group_id,
                fecha,
                titulo,
                texto,
            }
        )
    }

    async saveNotificacionPDF(user_group_id, fecha, titulo, texto) {
        return await axios.post(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/newpdf`, {
                user_group_id,
                fecha,
                titulo,
                texto,
            }
        )
    }

    async getNotificaciones(data) {
        let params = []
        if (data) {
            if (data.group_id) {
                params.push(`group_id=${data.group_id}`)
            }
            if (data.fecha_inicio) {
                params.push(`fecha_inicio=${data.fecha_inicio}`)
            }
            if (data.fecha_fin) {
                params.push(`fecha_fin=${data.fecha_fin}`)
            }
            if (data.user_email) {
                params.push(`user_email=${data.user_email}`)
            }
            if (data.id) {
                params.push(`id=${data.id}`)
            }
        }
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones` +
            (params.length > 0 ? '/' + params.join('/') : '')
        )
    }

    async getNotificacionesGetGroup(data) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/idgroup/${data}`
        )
    }

    async getNotificacionesGetGroupTitulo(data) {
        let route = ''
        if (data.user_email) {
            route += '?email=' + data.user_email;
        }
        if (data.fecha) {
            if (route != '') {
                route += '&fecha=' + data.fecha;
            } else {
                route += '?fecha=' + data.fecha;
            }
        }
        if (data.titulo) {
            if (route != '') {
                route += '&title=' + data.titulo;
            } else {
                route += '?title=' + data.titulo;
            }
        }
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/grupconcept/${route}`
        )
    }

    async getNotificacionesGroupCant(id, title) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/grupcant/${id}/${title}`
        )
    }

    async getNotificacionesGroupFirm(id, title) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/grupfirm/${id}/${title}`
        )
    }

    async getNotificacionesGetFindGroupTitle(data) {
        let route = ''
        if (data.user_email) {
            route += '?email=' + data.user_email;
        }
        if (data.fecha) {
            if (route != '') {
                route += '&fecha=' + data.fecha;
            } else {
                route += '?fecha=' + data.fecha;
            }
        }
        if (data.title) {
            if (route != '') {
                route += '&titulo=' + data.title;
            } else {
                route += '?titulo=' + data.title;
            }
        }
        if (data.groupId) {
            if (route != '') {
                route += '&group_id=' + data.groupId;
            } else {
                route += '?group_id=' + data.groupId;
            }
        }
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/${route}`
        )
    }

    async getNotificacionesGrupos(data) {
        let params = []
        if (data) {
            if (data.fecha) {
                params.push(`fecha=${data.fecha}`)
            }
            if (data.user_email) {
                params.push(`user_email=${data.user_email}`)
            }
            if (data.titulo) {
                params.push(`title=${data.titulo}`)
            }
        }
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/grupos` +
            (params.length > 0 ? '?' + params.join('&') : '')
        )
    }

    async getNotificacionById(id) {
        return await axios.get(
            `${process.env.REACT_APP_API_HOST}/signature-notificaciones/${id}`
        )
    }

}

const instance = new NotificacionesService()
export default instance