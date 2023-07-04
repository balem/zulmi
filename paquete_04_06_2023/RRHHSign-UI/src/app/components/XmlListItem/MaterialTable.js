import React, { useState } from "react";
import MaterialTable from 'material-table';

export default function DataTable(props) {

    const [data, setData] = useState(props.registro);

    const columns = [
        {
            title: '',
            field: 'acciones',
            width: "10%",
            cellStyle: { width: "10%" },
            headerStyle: { width: "10%" }
        },
        {
            title: '',
            field: 'item',
            width: "100%",
            cellStyle: { width: "100%" },
            headerStyle: { width: "100%" }
        },
        {
            title: '',
            field: 'employee',
            width: "5%",
            cellStyle: { width: "5%" },
            headerStyle: { width: "5%" },
            hidden: true,
            searchable: true
        },
    ]

    return (
        <MaterialTable
            columns={columns}
            data={data}
            title="Lista de Recibos"
            options={{
                padding: 'dense',
                //filtering: true,
                paging: true,
                pageSizeOptions: [5, 10, 20, 30, 50, 100],
                pageSize: 5
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