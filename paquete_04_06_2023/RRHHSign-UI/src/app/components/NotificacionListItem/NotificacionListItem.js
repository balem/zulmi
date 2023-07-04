import React from 'react';
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

function NotificacionListItem(props) {
    const classes = useStyles(props);

    const View = withRouter(({ history, id, groupId }) => (
        <IconButton
            onClick={() => { history.push(props.registro.nombres ? `/kude-notificaciones/${id}` : `/list-notificaciones-messages/${id}`) }}
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
                            {props.registro.titulo}
                        </Typography>

                        {renderIf(props.registro.nombres)(
                            <ChipIcon
                                icon={(props.registro.signature_employee === true ? "check_circle" : "radio_button_unchecked")}
                                tooltip={(props.registro.signature_employee === true ? "Firmado: " + Moment(props.registro.signature_employee_datetime).format('DD/MM/YYYY HH:mm:ss') + " por " + props.registro.nombres + ' ' + props.registro.apellidos : "NO FIRMADO")}
                                className="mr-4 z-0"
                                title={props.registro.nombres + ' ' + props.registro.apellidos}
                                color={(props.registro.signature_employee === true ? "#BBFABD" : "#F5B6AD")}
                                key={'status3'}
                            />
                        )}

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            {Moment(props.registro.fecha.split("T")[0]).local(momentESLocale).format('DD/MM/YYYY')}
                        </Typography>

                        
                    </div>

                    <div className="flex px-1 justify-right">
                        <View id={props.registro.id} groupId={props.registro.user_group_id}/>
                    </div>

                </ListItem>
            </Paper>
        </React.Fragment>
            );
        }
        
export default NotificacionListItem;