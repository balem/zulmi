import React from 'react';
import moment from "moment";
import { withRouter } from 'react-router-dom';
import { IconButton, Icon } from '@material-ui/core';
//import DatatableComponent from './DatatableComponent';
import MaterialTable from './MaterialTable';

var pfcount = 0;

export default class EmployeeListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            controlMtess: props.controlMtess,
            employee: props.registro,
            toggleActivate: props.toggleActivate
        }
    }
    
    render () {

        const ViewDetails = withRouter(({ history, id }) => (
            <IconButton
                size="small"
                title='Editar Empleado'
                onClick={() => { history.push(`/employees-details/${id}`) }}
            >
                <Icon>edit</Icon>
            </IconButton>
        ));

        let data = [];

        for (var i = 0; i < this.state.employee.length; i++) {
            let id = this.state.employee[i].id
            let active = this.state.employee[i].active
            let nombres = this.state.employee[i].nombres
            let apellidos = this.state.employee[i].apellidos
            let user_id = this.state.employee[i].user_id
            var rows = {
                    acciones:<><ViewDetails id={id}></ViewDetails> 
                           
                                <IconButton
                                    size="small"
                                    title={active ? 'Inhabilitar usuario' : 'Habilitar usuario'}
                                    onClick={() => { this.state.toggleActivate(id, active ? 0 : 1,nombres+" "+apellidos) }}
                                >
                                    <Icon>{ active ? 'block' : 'check' }</Icon>
                                </IconButton> 
                            
                               </> ,
                    cedula: this.state.employee[i].identification,
                    nombres: this.state.employee[i].nombres+" "+this.state.employee[i].apellidos,
                    email: this.state.employee[i].email,
                    estado: active ? "Activo" : 'Inactivo'
            }
            data.push(rows)
        }

        return (
            <MaterialTable 
                key={pfcount++}
                registro={data}>
            </MaterialTable>
        )
    }
}