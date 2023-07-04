import React, { useEffect } from 'react';
import { IconButton, Icon, Typography, Tooltip, ListItem, Paper, Checkbox } from '@material-ui/core';
import Chip from 'app/components/Chip';
import { grey, red, green, blue, amber } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import moment from "moment";

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

function DocumentListItem(props) {
    const classes = useStyles(props);

    const toggleDocSelect = props.toggleDocSelect

    const ViewXMLs = withRouter(({ history, id }) => (
        <Tooltip title="Visualizar funcionarios/documentos" placement="top">
            <IconButton
                onClick={() => { history.push(`/documents/${id}`) }}
                >
                <Icon>remove_red_eye</Icon>
            </IconButton>
        </Tooltip>
    ));

    return (
        <React.Fragment>
            <Paper className="p-12 mt-16">
                <ListItem
                    className={clsx(classes.listItem)}
                >
                    <div className="flex flex-col relative overflow-hidden pl-8">
                        <Checkbox
                            checked={props.registro.selected}
                            onChange={e => toggleDocSelect(props.registro)}
                        />
                    </div>
                    <div className="flex flex-1 flex-col relative overflow-hidden pl-8">

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Creador: {props.registro.creador}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            {props.registro.fecha_inicial} - {props.registro.fecha_final} (Creado el: {props.registro.createdAt})
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Firmado: {props.registro.signedXmls} / {props.registro.totalXmls}
                        </Typography>
                        
                        <div className={clsx(classes.labels, "flex mt-8")}>
                            <Chip
                                tooltip={props.registro.status}
                                className="mr-4 z-0"
                                title={props.registro.status}
                                color={(props.registro.status === "Pendiente" ? "#BDC8F8" : props.registro.status === "En Proceso" ? "#BBFABD" : props.registro.status === "Completado" ? "#F9F8AE" : "#F5B6AD")}
                                key={'status'}
                            />
                        </div>
                    </div>

                    <div className="flex px-1 justify-right">
                        <ViewXMLs id={props.registro.id} />
                    </div>

                </ListItem>
            </Paper>
        </React.Fragment>
            );
        }
        
export default DocumentListItem;