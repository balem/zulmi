import React, { useState } from "react";
import MaterialTable from 'material-table';

export default function DataTable(props) {

    const [data, setData] = useState(props.registro);

    const columns = [
        {
            title: 'Acciones',
            field: 'acciones',
            width: "10%",
            cellStyle: { width: "10%" },
            headerStyle: { width: "10%" }
        },
        {
            title: 'Nro C.I',
            field: 'cedula',
            width: "30%",
            cellStyle: { width: "30%" },
            headerStyle: { width: "30%" }
        },
        {
            title: 'Nombres',
            field: 'nombres',
            width: "50%",
            cellStyle: { width: "50%" },
            headerStyle: { width: "50%" }
        },
        {
            title: 'Email',
            field: 'email',
            width: "50%",
            cellStyle: { width: "50%" },
            headerStyle: { width: "50%" }
        },
        {
            title: 'Estado',
            field: 'estado',
            width: "30%",
            cellStyle: { width: "30%" },
            headerStyle: { width: "30%" }
        },
    ]

    return (
        <MaterialTable
            columns={columns}
            data={data}
            title="Lista de Empleados"
            options={{
                padding: 'dense',
                //filtering: true,
                paging: true,
                pageSizeOptions: [10, 20, 30, 50, 100],
                pageSize: 10
            }}
            localization={{
                pagination: {
                    labelDisplayedRows: '{from}-{to} de {count} registros',
                    labelRowsSelect: 'filas',
                    firstTooltip: 'Primera página',
                    previousTooltip: 'Página anterior',
                    nextTooltip: 'Próxima página',
                    lastTooltip: 'Última página'
                },
                header: {
                    actions: 'Acciones'
                },
                body: {
                    emptyDataSourceMessage: 'No se encontraron resultados',
                    filterRow: {
                        filterTooltip: 'Buscar'
                    }
                },
                toolbar: {
                    searchTooltip: 'Buscar',
                    searchPlaceholder: 'Buscar'
                }
            }}
        />
    );
}