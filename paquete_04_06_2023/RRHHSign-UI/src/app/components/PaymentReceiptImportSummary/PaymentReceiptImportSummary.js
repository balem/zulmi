import React from 'react';
import { Paper, Table, TableBody, TableRow, TableCell } from "@material-ui/core";

export default function PaymentReceiptImportSummary(props) {

    return (
        <Paper className="p-12 mt-16">
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell
                            className="cellWidth30"
                            fontWeight="fontWeightBold"
                            align="right"
                            scope="row"
                        >
                            Fecha de Documento
                            </TableCell>
                        <TableCell>
                            {props.doc.date}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            className="cellWidth30"
                            fontWeight="fontWeightBold"
                            align="right"
                            scope="row"
                        >
                            Fecha de Vencimiento
                            </TableCell>
                        <TableCell>
                            {props.doc.closeDate}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            className="cellWidth30"
                            fontWeight="fontWeightBold"
                            align="right"
                            scope="row"
                        >
                            Descripcion
                            </TableCell>
                        <TableCell>
                            {props.doc.description}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            className="cellWidth30"
                            fontWeight="fontWeightBold"
                            align="right"
                            scope="row"
                        >
                            Destinatários
                            </TableCell>
                        <TableCell>
                            {props.doc.employees}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            className="cellWidth30"
                            component="th"
                            align="right"
                            scope="row"
                        >
                            Documentos
                            </TableCell>
                        <TableCell>
                            {props.doc.documents}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            className="cellWidth30"
                            component="th"
                            align="right"
                            scope="row"
                        >
                            Creador
                            </TableCell>
                        <TableCell>
                            {props.doc.creator}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
}