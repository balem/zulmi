import React, { useState } from "react";
import MaterialTable from 'material-table';

export default function DataTable(props) {

    const [data, setData] = useState(props.registro);

    const columns = [
        {
            title: 'Acciones',
            field: 'acciones',
            width: 150,
        },
        {
            title: 'Funcionario',
            field: 'nombres',
            width: 270,
        },
        {
            title: 'Usuario',
            field: 'email',
            width: 270,
        },
        {
            title: 'Estado',
            field: 'estado',
            width: 200,
        },
    ]

    return (
        <MaterialTable
            columns={columns}
            data={data}
            title="Lista de Empleados"
            options={{
                cellStyle: {
                    width: 300,
                    minWidth: 300
                },
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