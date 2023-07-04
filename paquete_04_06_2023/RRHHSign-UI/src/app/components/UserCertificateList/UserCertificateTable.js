import React, { useState } from "react";
import MaterialTable from 'material-table';

export default function DataTable(props) {

  const [data, setData] = useState(props.registro);

  const columns = [
    {
      title: 'Nro C.I',
      field: 'cedula',
      width: "10%",
      cellStyle: { width: "10%" },
      headerStyle: { width: "10%" }
    },
    {
      title: 'Nombres',
      field: 'nombres',
      width: "30%",
      cellStyle: { width: "30%" },
      headerStyle: { width: "30%" }
    },
    {
      title: 'Tipo',
      field: 'tipo_certificado',
      width: "10%",
      cellStyle: { width: "10%" },
      headerStyle: { width: "10%" }
    },
    {
      title: 'Fecha Emisión',
      field: 'fecha_inicial',
      width: "10%",
      cellStyle: { width: "10%" },
      headerStyle: { width: "10%" }
    },
    {
      title: 'Fecha Vencimiento',
      field: 'fecha_final',
      width: "10%",
      cellStyle: { width: "10%" },
      headerStyle: { width: "10%" }
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