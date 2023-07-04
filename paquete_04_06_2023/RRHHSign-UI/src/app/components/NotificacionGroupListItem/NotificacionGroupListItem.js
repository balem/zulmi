import React, { useEffect, useRef, useState } from 'react';
import { IconButton, Icon, Typography, Tooltip, ListItem, Paper } from '@material-ui/core';
import Chip from 'app/components/Chip';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import Moment from "moment";
import momentESLocale from "moment/locale/es";
import renderIf from 'app/main/Utils/renderIf';
import ChipIcon from 'app/components/ChipIcon';

const useStyles = makeStyles({
    listItem: {
        '&.completed': {
            background: 'rgba(0,0,0,0.03)',
            '& .todo-title, & .todo-notes': {
                textDecoration: 'line-through'
            }
        }
    }
});

function NotificacionGroupListItem(props) {
    const classes = useStyles(props);
    const [cant, setCant] = useState('');
    const [firm, setFirm] = useState('');

    const View = withRouter(({ history, title, groupId, NotiGroup }) => (
        <IconButton
            onClick={() => { history.push(`/list-notificaciones?groupid=${NotiGroup}&title=${title}`) }}
        >
            <Icon>remove_red_eye</Icon>
        </IconButton>
    ));

    return (
        <React.Fragment>
            <Paper className="p-12 mt-16">
                <ListItem
                    className={clsx(classes.listItem)}
                >
                    <div className="flex flex-1 flex-col relative overflow-hidden pl-8">

                    <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Grupo: {props.registro.name}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Titulo: {props.registro.titulo[0]}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Fecha: {Moment(props.registro.fecha.split("T")[0]).local(momentESLocale).format('DD/MM/YYYY')}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Notif.: {props.registro.cant} / Firm.: {props.registro.firm}
                        </Typography>

                    </div>

                    <div className="flex px-1 justify-right">
                        <View title={props.registro.titulo} NotiGroup={props.registro.grupo_notificacion_id} groupId={props.registro.user_group_id}/>
                    </div>

                </ListItem>
            </Paper>
        </React.Fragment>
            );
        }
        
export default NotificacionGroupListItem;