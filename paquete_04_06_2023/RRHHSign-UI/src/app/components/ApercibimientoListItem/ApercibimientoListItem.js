import React from 'react';
import { IconButton, Icon, Typography, Tooltip, ListItem, Paper } from '@material-ui/core';
import Chip from 'app/components/Chip';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import Moment from "moment";
import momentESLocale from "moment/locale/es";

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

function ApercibimientoListItem(props) {
    const classes = useStyles(props);

    const View = withRouter(({ history, id }) => (
        <IconButton
        onClick={() => { history.push(`kude-apercibimiento/${id}`) }}
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
                            {props.registro.nombres + ' ' + props.registro.apellidos}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            {Moment(props.registro.fecha_amonestacion).local(momentESLocale).format('MM/DD/YYYY')}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            {props.registro.motivo}
                        </Typography>
                    </div>

                    <div className="flex px-1 justify-right">
                        <View id={props.registro.id} />
                    </div>

                </ListItem>
            </Paper>
        </React.Fragment>
            );
        }
        
export default ApercibimientoListItem;