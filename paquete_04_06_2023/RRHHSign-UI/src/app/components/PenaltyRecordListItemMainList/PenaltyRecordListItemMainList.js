import React from 'react';
import { IconButton, Icon, Typography, ListItem, Tooltip } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import Chip from 'app/components/Chip';
import { withRouter } from 'react-router-dom';
import { Store } from "app/react-store/Store";
import renderIf from "app/main/Utils/renderIf";

const useStyles = makeStyles({
    todoItem: {
        '&.completed': {
            background: 'rgba(0,0,0,0.03)',
            '& .todo-title, & .todo-notes': {
                textDecoration: 'line-through'
            }
        }
    }
});


export default class PenaltyRecordListItemMainList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.registro
		}
    }

    /* componentDidUpdate(props) {
        if (this.state.value !== props.registro) {
            this.setState({value: props.registro});
        }
    }  */

    componentDidUpdate(prevProps, prevState) {
        // only update chart if the data has changed
        if (prevProps.registro !== this.props.registro) {
            this.setState({ value: this.props.registro});
        }
    }
    
    render() {
        return (
            <div>
                {this.state.value.length === 0 ? 
                    <div></div>
                :
                    this.state.value[0].id === 0 ? 
                    <React.Fragment>
                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Mensaje: {this.state.value[0].message}
                        </Typography>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Estado: {this.state.value[0].estado}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            className="todo-title truncate"
                            color={"inherit"}
                        >
                            Tipo Multa: {this.state.value[0].tipo}
                        </Typography>
                    </React.Fragment>
                }
            </div>
        )
    }
}
