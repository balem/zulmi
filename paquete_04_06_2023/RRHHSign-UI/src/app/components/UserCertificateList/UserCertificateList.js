import React from 'react';
import moment from "moment";
//import DatatableComponent from './DatatableComponent';
import UserCertificateTable from './UserCertificateTable';

var pfcount = 0;

export default class EmployeeListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employee: props.registro,
            toggleActivateMtess: props.toggleActivateMtess,
            toggleActivate: props.toggleActivate
        }
    }
    
    render () {

        let data = [];

        for (var i = 0; i < this.state.employee.length; i++) {
            var rows = {
                    cedula: this.state.employee[i].identification,
                    nombres: this.state.employee[i].nombres+" "+this.state.employee[i].apellidos,
                    tipo_certificado: this.state.employee[i].cert_type,
                    certificado: this.state.employee[i].cert_added === true ? moment(this.state.employee[i].cert_date.split("T")[0]).format("DD/MM/YYYY")+" "+ this.state.employee[i].cert_date.split("T")[1].split(".")[0]: "No importado",
                    fecha_inicial: this.state.employee[i].cert_start != null ? moment(this.state.employee[i].cert_start.split("T")[0]).format("DD/MM/YYYY") : "No estimado",
                    fecha_final: this.state.employee[i].cert_end != null ? moment(this.state.employee[i].cert_end.split("T")[0]).format("DD/MM/YYYY") : "No estimado"
                }
            data.push(rows)
        }

        return (
            <UserCertificateTable 
                key={pfcount++}
                registro={data}>
            </UserCertificateTable>
        )
    }
}