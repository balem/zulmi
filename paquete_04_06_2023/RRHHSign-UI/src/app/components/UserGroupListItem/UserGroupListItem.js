import React from 'react';
import { IconButton, Icon, Typography, Tooltip, ListItem, Paper } from '@material-ui/core';
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

function UserGroupListItem(props) {
    const classes = useStyles(props);

    const ViewXMLs = withRouter(({ history, id }) => (
        <IconButton
            onClick={() => { history.push(`/user-group-details/${id}`) }}
        >
            <Icon>edit</Icon>
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
                            {props.registro.name}
                        </Typography>

                    </div>

                    <div className="flex px-1 justify-right">
                        <ViewXMLs id={props.registro.id} />
                    </div>

                </ListItem>
            </Paper>
        </React.Fragment>
            );
        }
        
export default UserGroupListItem;