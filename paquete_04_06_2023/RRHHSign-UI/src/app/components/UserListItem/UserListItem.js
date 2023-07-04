import React from 'react';
import moment from "moment";
import { withRouter } from 'react-router-dom';
import { IconButton, Icon } from '@material-ui/core';
//import DatatableComponent from './DatatableComponent';
import ReactDataTable from './ReactDataTable';

var pfcount = 0;

export default class UserListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            usuarios: props.registro,
            usuarios_perfiles: props.usuarios_perfiles,
            toggleActivate: props.toggleActivate
        }
    }
    
    render () {

        let data = [];

        for (var i = 0; i < this.state.usuarios.length; i++) {
            let id = this.state.usuarios[i].id
            let active = this.state.usuarios[i].active
            let name = this.state.usuarios[i].name
            var rows = {
                    acciones:<>
                            <IconButton
                                size="small"
                                title='Asignar Perfiles'
                                onClick={() => { this.state.usuarios_perfiles(id) }}
                                >
                                <Icon>edit</Icon>
                            </IconButton> 
                            <IconButton
                                size="small"
                                title={active ? 'Inhabilitar Usuario' : 'Habilitar Usuario'}
                                onClick={() => { this.state.toggleActivate(id, active ? 0 : 1,name) }}
                                >
                                <Icon>{ active ? 'block' : 'check' }</Icon>
                            </IconButton> 
                        </>,
                    nombres: this.state.usuarios[i].name,
                    email: this.state.usuarios[i].email,
                    estado: active ? "Activo" : 'Inactivo'
            }
            data.push(rows)
        }

        return (
            <ReactDataTable 
                key={pfcount++}
                registro={data}>
            </ReactDataTable>
        )
    }
}