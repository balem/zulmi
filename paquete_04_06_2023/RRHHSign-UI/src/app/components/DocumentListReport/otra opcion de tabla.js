<FuseAnimate animation={{ translateY: [0, '100%'] }} duration={600}>
            <Card className="mx-auto w-xl print:w-full print:shadow-none">
                <CardContent>
                    <div >
                        <Table>
                            <TableHead>
                                 <tr>
                                    <th style={{width: '5%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">
                                        <Typography className="font-light" style={{textAlign: 'center',fontWeight: 'bold', fontSize: '15px'}}>
                                            Nro. Rec.
                                        </Typography>
                                    </th>
                                    <th style={{width: '5%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">
                                        <Typography className="font-light" style={{textAlign: 'center',fontWeight: 'bold', fontSize: '15px'}}>
                                            Mes
                                        </Typography>
                                    </th>
                                    <th style={{width: '5%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '15px'}}>
                                            Tipo
                                        </Typography>
                                    </th>
                                    <th style={{width: '5%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '15px'}}>
                                            Sucursal
                                        </Typography>
                                    </th>
                                    <th style={{width: '20%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '15px'}}>
                                            Empleado
                                        </Typography>
                                    </th>
                                    <th style={{width: '15%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '15px'}}>
                                            Firma
                                        </Typography>
                                    </th>
                                    <th style={{width: '15%', "borderWidth":"1px", 'borderColor':"#aaaaaa", 'borderStyle':'solid'}} align="center">                             
                                        <Typography className="font-light" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '15px'}}>
                                            Envio Mtess
                                        </Typography>
                                    </th>
                                </tr>
                            </TableHead>
                            <TableBody>
                            {this.state.xml.map((details) => (
                                    <TableRow>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography>{details.numero_recibo}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography>{moment(details.periodo).format("MM/YYYY")}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography>{details.identificator}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography>{details.sucursal}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography>{details.nombres} {details.apellidos}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography>{details.signature_employee === false ? "Pendiente" : moment(details.signature_employee_datetime.split("T")[0]).format("DD/MM/YYYY")+" "+details.signature_employee_datetime.split("T")[1].split(".")[0]}</Typography>
                                        </TableCell>
                                        <TableCell align="center" style={{fontSize: '12px'}}>
                                            <Typography>{details.envio_mtess === true ? moment(details.envio_mtess_date.split("T")[0]).format("DD/MM/YYYY")+" "+details.envio_mtess_date.split("T")[1].split(".")[0] : "Pendiente"}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </FuseAnimate>