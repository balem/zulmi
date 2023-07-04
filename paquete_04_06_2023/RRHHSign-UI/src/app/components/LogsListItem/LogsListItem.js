import React from 'react';
import { IconButton, Icon, Typography, Tooltip, ListItem, Paper } from '@material-ui/core';
import Chip from 'app/components/Chip';
import { grey, red, green, blue, amber } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
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

function LogsListItem(props) {
    const classes = useStyles(props);

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
                            {props.registro.nombres}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            {props.registro.message}
                        </Typography>

                        {props.registro.recibo && (
                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                            >
                                Nro. Rec.: {props.registro.recibo}
                            </Typography>
                        )}
                        
                    </div>

                    

                    <div className="flex px-1 justify-right">
                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            {props.registro.created_at}
                        </Typography>
                    </div>

                </ListItem>
            </Paper>
        </React.Fragment>
            );
        }
        
export default LogsListItem;