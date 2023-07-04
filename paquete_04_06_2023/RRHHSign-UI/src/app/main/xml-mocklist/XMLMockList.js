import {
    Typography,
    Grid,
    Paper,
    IconButton,
    Button,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Icon,
    CircularProgress
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import "./XMLMockList.css";
import { useSelector } from 'react-redux';
import { Store } from "app/react-store/Store.js";
import DocumentsService from './../../services/DocumentsService/index';
import EmployeeService from './../../services/EmployeeService/index';
import XmlService from './../../services/XmlService/index';
import moment from 'moment';
import momentESLocale from "moment/locale/es";

import MTESSService from './../../services/MTESSService/index';
import MessageService from './../../services/MessageService/index';
import SignatureService from './../../services/SignatureService/index';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import renderIf from "../Utils/renderIf";
import XmlListItem from "app/components/XmlListItem";
import ComprobanteService from "app/services/ComprobanteService";
import ComunicacionService from "app/services/ComunicacionService";
import ControlService from "app/services/ControlService";
import aes256 from 'aes256';

let emptyDoc = {
    startDate: '',
    endDate: '',
    employees: 0,
    xmls: 0,
    creator: '',
    status: '',
}

var pfcount = 0;

function XMLMockList(props) {
    const { state, dispatch } = React.useContext(Store);
    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let username = user.data.email.split("@", 2);
    username = username[0];
    let userProfile = user.role[0];
    const dispatchMsg = useDispatch();

    const [documentId, handleDocumentId] = useState(props.match.params.id);
    const [document, handleDocument] = useState(emptyDoc);
    const [visibleXmls, handleVisibleXmls] = useState([]);
    const [actualPage, handleActualPage] = useState(0);
    const [pageRefreshCount, handlePageRefreshCount] = useState(0);
    const [xmls, handleXmls] = useState([]);
    const [xmlscount, handleXmlsCount] = useState(0);
    const [dialogType, handleDialogType] = useState();
    const XMLS_PER_PAGE = 10;
    let signedCount = 0
    const [control, handleControl] = useState([]);
    // const [xmlId, handleXmlId] = useState(props.match.params.id);
    // const [xml, handleXml] = useState([]);
    // const [employee, handleEmployee] = useState([]);
    const [viewRRHH, setViewRRHH] = useState(false);
    const [open, setOpen] = useState(false);
    const [openF1, setOpenF1] = useState(false);
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [motivoDesactivacion, handleMotivoDesactivacion] = useState();
    const [pin, handlePin] = useState('');
    const [invoiceHaberes, handreInvoiceHaberes] = useState(false);
    const [authUrl, handleAuthUrl] = useState('');
    const [buttonState, handleButtonState] = useState(false)
    const [cert_type, handleCertType] = useState('');

    function message(type = "null", message = "") {
        dispatchMsg(
            Actions.showMessage({
                message: message,
                autoHideDuration: 6000, //ms
                anchorOrigin: {
                    vertical: "top", //top bottom
                    horizontal: "center" //left center right
                },
                variant: type //success error info warning null
            })
        );
    }

    async function fetchDocument() {
        let responseDocuments = await DocumentsService.getDocumentById(documentId);
        let responseEmployees = [];
        let responseXmls = [];
        if (userProfile == 'funcionario') {
            responseEmployees = await EmployeeService.getEmployeesCount(documentId);
            responseXmls = await XmlService.getXmlsCount(documentId);
        } else {
            responseEmployees = await EmployeeService.getEmployeesCount(documentId);
            responseXmls = await XmlService.getXmlsCount(documentId);
        }

        var motivo = '';

        // console.log("DOCS: " + JSON.stringify(responseDocuments));
        // console.log("EMPS: " + JSON.stringify(responseEmployees));
        // console.log("XMLS: " + JSON.stringify(responseXmls));

        if (responseDocuments.data[0].motivoDesactivacion != 'undefined') {
            motivo = responseDocuments.data[0].motivoDesactivacion;
        } else {
            motivo = '';
        }

        let doc = {
            startDate: moment(responseDocuments.data[0].startDate).format('DD/MM/YYYY'),
            endDate: moment(responseDocuments.data[0].endDate).format('DD/MM/YYYY'),
            employees: responseEmployees.data,
            xmls: responseXmls.data,
            creator: responseDocuments.data[0].creator,
            status: responseDocuments.data[0].status,
            motivoDesactivacion: motivo,
        }

        // console.log("DOC", JSON.stringify(doc));

        handleDocument(doc);
    }

    useEffect(() => {
        fetchDocument();
        fetchXmls();
    }, [documentId]);

    async function documentosFirmados(documentId) {
        var xmls = await XmlService.getRecibosFirmados(documentId);
        handleXmlsCount(xmls.data.data.length)
    }

    async function fetchXmls() {
        let responseXmls;
        let responseComprobantes;

        var control = await ControlService.getControl();
        var signning = await ControlService.getControlSigners();
        var director = await EmployeeService.getDirector(userEmail);

        handleControl(control);
        handreInvoiceHaberes(control.data.data[0].invoice_haberes);
        if (control.data.data[0].invoice_haberes == true) {
            if (userProfile === 'funcionario') {
                responseXmls = await XmlService.getXmlsForEmployee(documentId, userEmail);
                responseComprobantes = await ComprobanteService.getComprobantesForEmployee(documentId, userEmail);
            } else {
                responseXmls = await XmlService.getXmls(documentId);
                responseComprobantes = await ComprobanteService.getComprobantes(documentId);
            }
        } else {
            if (userProfile === 'funcionario') {
                responseXmls = await XmlService.getXmlsForEmployee(documentId, userEmail);
                responseComprobantes = null;
            } else {
                responseXmls = await XmlService.getXmls(documentId);
                responseComprobantes = null;
            }
        }
        let listItems = []
        if (responseXmls.status != 200) {
            message('error', responseXmls.data);
        } else {
            //console.log('DOC STATUS: ', document.status)
            let processedXml = null;
            console.log('XMLS ', responseXmls.data);
            let xmls = responseXmls.data.map(xml => {
                processedXml = {
                    id: xml.xml.id,
                    type: 'Haberes',
                    data: moment(xml.xml.mesDePago).local(momentESLocale).format('MMM YYYY'),
                    docStatus: document.status,
                    rejections: xml.rejections ? xml.rejections : 0,
                    first_view: false,
                    second_view: false,
                    third_view: false,
                    signatureDirector: xml.xml.signatureDirectorDatetime,
                    signatureEmployee: xml.xml.signatureEmployeeDatetime
                };
                for (let i = 0; i < signning.data.data.length; i++) {
                    if (signning.data.data[i].sign_name == 'Funcionario') {
                        processedXml.third_signer = xml.xmlName;
                        processedXml.third_status = xml.xml.signatureEmployee === true ? true : false;
                        processedXml.third_view = true;
                    }
                    if (signning.data.data[i].sign_name == 'RH') {
                        processedXml.first_signer = xml.xml.signatureRRHHName !== null ? xml.xml.signatureRRHHName : 'RRHH';
                        processedXml.first_status = xml.xml.signatureRRHH === true ? true : false;
                        processedXml.first_view = true;
                    }
                    var viewDirector = 'Apoderado';

                    if (director != undefined) {
                        viewDirector = director.name;
                        console.log(viewDirector)
                    } else {
                        message('error', "No existe un perfil Director/Apoderado");
                    }
                    if (signning.data.data[i].sign_name == 'Director') {
                        processedXml.second_signer = xml.xml.signatureDirector === true ? xml.xml.signatureDirectorName : viewDirector;
                        processedXml.second_status = xml.xml.signatureDirector === true ? true : false;
                        processedXml.second_view = true;
                    }
                };
                console.log(processedXml);
                return processedXml;
            });
            console.log('Datos 1: ', xmls);
            xmls.forEach(xml => {
                const signed = xml.second_status && xml.third_status
                if (signed) {
                    signedCount++
                }
                listItems.push(xml)
            })
        }

        if (responseComprobantes) {
            if (responseComprobantes.status != 200) {
                message('error', responseComprobantes.data);
            } else {
                let processedXml = null;
                console.log('XMLS ', responseComprobantes.data);
                let xmls = responseComprobantes.data.map(comprobante => {
                    processedXml = {
                        id: comprobante.comprobante.id,
                        type: 'Comprobante',
                        data: moment(comprobante.comprobante.mesDePago).local(momentESLocale).format('MMM YYYY'),
                        docStatus: document.status,
                        rejections: 0,
                        first_view: false,
                        second_view: false,
                        third_view: false,
                        signatureDirector: comprobante.comprobante.signatureDirectorDatetime,
                        signatureEmployee: comprobante.comprobante.signatureEmployeeDatetime
                    }
                    for (let i = 0; i < signning.data.data.length; i++) {
                        if (signning.data.data[i].sign_name == 'Funcionario') {
                            processedXml.third_signer = comprobante.comprobanteName;
                            processedXml.third_status = comprobante.comprobante.signatureEmployee === true ? true : false;
                            processedXml.third_view = true;
                        }
                        if (signning.data.data[i].sign_name == 'RH') {
                            processedXml.first_signer = comprobante.comprobante.signatureRRHHName !== null ? comprobante.comprobante.signatureRRHHName : 'RRHH';
                            processedXml.first_status = comprobante.comprobante.signatureRRHH === true ? true : false;
                            processedXml.first_view = true;
                        }
                        var viewDirector = 'Director';
                        if ((director.name) && (director.name.length > 0)) {
                            viewDirector = director.name;
                        }
                        if (signning.data.data[i].sign_name == 'Director') {
                            processedXml.second_signer = viewDirector;
                            processedXml.second_status = comprobante.comprobante.signatureDirector === true ? true : false;
                            processedXml.second_view = true;
                        }
                    };
                    return processedXml;
                });
                console.log('Datos 2:', xmls);
                xmls.forEach(xml => {
                    const signed = xml.second_status && xml.third_status
                    if (signed) {
                        signedCount++
                    }
                    listItems.push(xml)
                })
            }
        }
        handleXmls(listItems);
        updatePage(0)
    }

    const updatePage = (page) => {
        handleActualPage(page)
    }

    const updateVisibleXmls = (forcePage) => {
        const start = (forcePage ? forcePage : actualPage) * XMLS_PER_PAGE
        const newVisibleXmls = xmls.slice(start, (start + XMLS_PER_PAGE))
        handleVisibleXmls(newVisibleXmls)
    }

    useEffect(() => {
        handlePageRefreshCount(pageRefreshCount + 1);
        getSignedRrhhDocsCount();
        getCertType()
    }, [xmls])

    useEffect(() => {
        documentosFirmados(documentId)
        console.log('Actual page changed')
        updateVisibleXmls()
    }, [actualPage, pageRefreshCount])

    function handleNotificar() {
        let data = {
            from: userEmail,
            profile: userProfile,
            documentId: documentId
        };

        if (userProfile == 'rh') {
            MessageService.SendReminderEmployee(data).then(response => {
                if (response.status != 200) {
                    message('error', response.data.message);
                } else {
                    message('success', response.data.message);
                }
            });
        } else {

            MessageService.SendReminder(data).then(response => {
                if (response.status != 200) {
                    message('error', response.data.message);
                } else {
                    message('success', response.data.message);
                }
            });
        }



    }

    async function getCertType() {
        var response = await ControlService.getTypeCert(userEmail)
        handleCertType(response.data.data[0].cert_type)
    }

    function getSignedDocsCount() {
        return xmls.reduce((p, a) => {
            return p + (a.second_status && a.third_status ? 1 : 0)
        },
            0
        )
    }

    async function getSignedRrhhDocsCount() {
        const signner = await ControlService.getControlSigners();
        var rrhhSign = false;
        if (signner) {
            for (var i = 0; i < signner.data.data.length; i++) {
                if (signner.data.data[i].sign_name == 'RH') {
                    rrhhSign = true;
                }
            }
        }
        if (rrhhSign == true) {
            let result = await xmls.filter(xml => xml.type == 'Haberes').reduce((p, a) => {
                let value = p + (a.second_status ? 1 : 0);
                return value;
            }, 0);
            if (result == 0) {
                setViewRRHH(true)
            }
        }
    }

    function getSignedRrhhComprobantesCount() {
        return xmls.filter(xml => xml.type == 'Comprobante').reduce((p, a) => {
            return p + (a.second_status ? 1 : 0)
        },
            0
        )
    }

    function handleDialogRecibosOpen() {
        handleDialogType('xml')
        handleClickOpen()
    }

    function handleDialogComprobantesOpen() {
        handleDialogType('comprobante')
        handleClickOpen()
    }

    async function handleClickOpen() {
        if (cert_type == 'F1') {
            setOpenF1(true);
        } else {
            setOpen(true);
            const response = await SignatureService.SignatureSession()
            handleAuthUrl(response.data.auth[0]._authUrl)
            getSessionId(response.data.session_id)
        }
    }

    async function getSessionId(id) {
        var data = {
            session_id: id
        }
        var sessionInfo = await SignatureService.getSessionId(data);
        if (sessionInfo.data.status == 'success') {
            setOpen(false);
            handleButtonState(true)
            sign(sessionInfo.data.data, id)
            return
        } else {
            console.log(sessionInfo.data)
        }

        setTimeout(function () {
            getSessionId(id);
        }, 1000);
    }

    async function sign(sessionInfo, id) {
        console.log(sessionInfo)
        var code = sessionInfo[0].code;
        var state = sessionInfo[0].state;
        var key = process.env.REACT_APP_KEY_PASS;
        var email = aes256.encrypt(key, userEmail.toLowerCase().trim());
        var perfil = aes256.encrypt(key, userProfile.toLowerCase().trim());
        var data = {
            code: code,
            state: state,
            session_id: id,
            user_email: email,
            user_profile: perfil,
            document_id: documentId
        };
        var resultSignature = await SignatureService.SignAll(data, dialogType)

        if (resultSignature.data.status === "success") {
            handleButtonState(false)
            message("success", resultSignature.data.data);
            if (userProfile == 'director' || userProfile == 'rh') {
                await handleNotificar()
            }
        } else {
            handleButtonState(false)
            message("error", resultSignature.data.data);
        }

        await fetchXmls()

    }

    async function handleCancelClose() {
        setOpen(false);
    }

    async function signF1() {
        var key = process.env.REACT_APP_KEY_PASS;
        if (pin != "") {

            //CHAMA API PARA SALVAR
            var email = aes256.encrypt(key, userEmail);
            var pinc = aes256.encrypt(key, pin);
            var perfil = aes256.encrypt(key, userProfile);
            var data = {
                code: null,
                state: null,
                session_id: null,
                user_email: email,
                user_profile: perfil,
                document_id: documentId,
                pin: pinc
            };

            let resultSignature = await SignatureService.SignAll(data, 'recibo');

            if (resultSignature.status === 200) {
                //VERIFICAR STATUS
                if (resultSignature.data.status === "success") {
                    message("success", resultSignature.data.data);
                    if (userProfile == 'rh' || userProfile == 'director') {
                        setTimeout(() => {
                            handleNotificar()
                        }, 2000);
                    }
                } else {
                    message("error", resultSignature.data.data);
                }

                setOpenF1(false);
                handlePin("");
                fetchXmls()
                fetchDocument()
            } else {
                message("error", resultSignature.data.data);
            }

        } else {
            message("error", "Debe ingresar el pin");
        }


    }

    async function handleDeactivateCancelClose() {
        setDeactivateOpen(false);
    }

    async function handleDeactivateClose() {
        setDeactivateOpen(false);
        if (motivoDesactivacion != "") {
            deactivateDocument()
        }
    }

    async function deactivateDocument() {
        await DocumentsService.deactivateDocument(documentId, motivoDesactivacion, userEmail)
        await fetchDocument()
        return message("success", "Documento desactivado exitosamente");
    }

    async function uploadMTESS(documentId) {
        let data = {
            user_email: userEmail,
            id: documentId
        }
        let responseSendMTESS = await MTESSService.sendDocumentXMLsToMTESS(data);

        if (responseSendMTESS.status === 200) {

            return message("success", responseSendMTESS.data.message);

        } else {
            message("error", responseSendMTESS.data.message);
            return;
        }
    }

    function downloadEmployeesToSign() {
        //window.location.href = `${process.env.REACT_APP_API_HOST}/document/${documentId}/unsigned-employees-excel`
        window.location.href = process.env.REACT_APP_API_HOST + '/document/' + documentId + '/unsigned-employees-excel';
    }

    function downloadEmployeesSign() {
        //window.location.href = `${process.env.REACT_APP_API_HOST}/document/${documentId}/signed-employees-excel`
        window.location.href = process.env.REACT_APP_API_HOST + '/document/' + documentId + '/signed-employees-excel';
    }

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Paper className="p-12 mb-24">
                    <Tooltip title="Volver" placement="top">
                        <IconButton
                            onClick={() => { props.history.goBack() }}
                        >
                            <Icon>arrow_back</Icon>
                        </IconButton>
                    </Tooltip>
                </Paper>
                <Typography className="h1 mb-24">Recibo de Haberes &gt; Documentos Disponibles</Typography>
                {(renderIf(userProfile == 'rh'))(
                    <Paper className="p-12">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        className="cellWidth30"
                                        fontWeight="fontWeightBold"
                                        align="right"
                                        scope="row"
                                    >
                                        Fecha Inicial
                                    </TableCell>
                                    <TableCell>
                                        {document.startDate}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        className="cellWidth30"
                                        fontWeight="fontWeightBold"
                                        align="right"
                                        scope="row"
                                    >
                                        Fecha Final
                                    </TableCell>
                                    <TableCell>
                                        {document.endDate}
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
                                        {document.employees}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        className="cellWidth30"
                                        component="th"
                                        align="right"
                                        scope="row"
                                    >
                                        Documentos Firmados
                                    </TableCell>
                                    <TableCell>
                                        {getSignedDocsCount()}
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
                                        {document.creator}
                                    </TableCell>
                                </TableRow>
                                {(renderIf(document.motivoDesactivacion))(
                                    <TableRow>
                                        <TableCell
                                            className="cellWidth30"
                                            component="th"
                                            align="right"
                                            scope="row"
                                        >
                                            Motivo de Desactivación
                                        </TableCell>
                                        <TableCell>
                                            {document.motivoDesactivacion}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>
                )}

                {(renderIf(xmls.length > 0 && (userProfile == 'director')))(
                    <div>
                        {(renderIf(getSignedRrhhComprobantesCount() >= 0 || !viewRRHH))(
                            <div style={{ display: 'inline-block' }}>
                                {!viewRRHH || (getSignedRrhhComprobantesCount() >= 0) ?
                                    <Tooltip title="Firmar Todos los Recibos" placement="top">
                                        <IconButton
                                            //disabled={buttonFirmar}
                                            onClick={handleDialogRecibosOpen}
                                        >
                                            {buttonState ? <CircularProgress size={20} /> : <Icon>assignment_turned_in</Icon>}
                                        </IconButton>
                                    </Tooltip>
                                    :
                                    <Grid></Grid>
                                }
                                {(renderIf(getSignedRrhhComprobantesCount() >= 0 && (invoiceHaberes == true)))(
                                    <Tooltip title="Firmar Todos los Comprobantes de Pago" placement="top">
                                        <IconButton
                                            //disabled={buttonFirmar}
                                            onClick={handleDialogComprobantesOpen}
                                        >
                                            <Icon>beenhere</Icon>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {(renderIf(xmls.length > 0 && (userProfile == 'rh_not_signer' || userProfile == 'rh')))(
                    <div>
                        {(renderIf(userProfile.indexOf('rh') == -1))(
                            <div style={{ display: 'inline-block' }}>
                                {viewRRHH ?
                                    <Tooltip title="Firmar Todos los Recibos" placement="top">
                                        <IconButton
                                            //disabled={buttonFirmar}
                                            onClick={handleDialogRecibosOpen}
                                        >
                                            {buttonState ? <CircularProgress size={20} /> : <Icon>assignment_turned_in</Icon>}
                                        </IconButton>
                                    </Tooltip>
                                    :
                                    <Grid></Grid>
                                }
                                {(renderIf(getSignedRrhhComprobantesCount() == 0 && (invoiceHaberes == true)))(
                                    <Tooltip title="Firmar Todos los Comprobantes de Pago" placement="top">
                                        <IconButton
                                            //disabled={buttonFirmar}
                                            onClick={handleDialogComprobantesOpen}
                                        >
                                            <Icon>beenhere</Icon>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        )}

                        {(renderIf((userProfile == 'rh' || userProfile == 'rh_not_signer') && getSignedDocsCount() < xmls.length))(
                            <Tooltip title='Notificar usuarios' placement="top">
                                <IconButton
                                    onClick={handleNotificar}
                                >
                                    <Icon>email</Icon>
                                </IconButton>
                            </Tooltip>
                        )}
                        {(renderIf(userProfile.indexOf('rh') > -1))(
                            <div style={{ display: 'inline-block' }}>
                                {viewRRHH ?
                                    <Tooltip title="Firmar Todos los Recibos" placement="top">
                                        <IconButton
                                            //disabled={buttonFirmar}
                                            onClick={handleDialogRecibosOpen}
                                        >
                                            <Icon>assignment_turned_in</Icon>
                                        </IconButton>
                                    </Tooltip>
                                    :
                                    <Grid></Grid>
                                }

                            </div>
                        )}
                        {renderIf(xmlscount == 0)(
                            <Tooltip title="Enviar lote de documento al MTESS" placement="top">
                                <IconButton
                                    onClick={() => uploadMTESS(documentId)}
                                >
                                    <Icon>cloud_upload</Icon>
                                </IconButton>
                            </Tooltip>
                        )}
                        {renderIf(userProfile == 'rh' && document.status == 'PEN')(
                            <Tooltip title="Desactivar lote de documento" placement="top">
                                <IconButton
                                    onClick={() => setDeactivateOpen(true)}
                                >
                                    <Icon>block</Icon>
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                )}

                <Dialog open={open} onClose={handleCancelClose} maxWidth={1000} >
                    <DialogContent>
                        <iframe src={authUrl} width={1000} height={600}></iframe>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelClose} color="primary">
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openF1} onClose={handleCancelClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Para firmar el documento, debe proporcionar su PIN de certificado digital.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="pin"
                            onChange={e => handlePin(e.target.value)}
                            label="PIN"
                            type="password"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelClose} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={signF1} color="primary">
                            Firmar
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={deactivateOpen} onClose={handleDeactivateClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-deactivate-dialog-title">Desactivar documento</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Por favor, ingrese el motivo de la desactivación del documento.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="motivoDesactivacion"
                            label="Motivo"
                            value={motivoDesactivacion}
                            onChange={e => handleMotivoDesactivacion(e.target.value)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeactivateCancelClose} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeactivateClose} color="primary">
                            Desactivar Documento
                        </Button>
                    </DialogActions>
                </Dialog>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        {(renderIf(xmls.length > 0))(
                            <XmlListItem key={pfcount++} registro={xmls} control={control}></XmlListItem>
                        )}
                    </Grid>
                </Grid>

                {(renderIf(xmls.length > 0 && userProfile === 'rh'))(
                    <Grid container spacing={3}>
                        <Grid item xs={6} md={6}>
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                className="mx-auto mt-32"
                                aria-label="Filtrar"
                                onClick={downloadEmployeesToSign}
                            //disabled={!isContactsFormValid}
                            >
                                Descargar Lista de Empleados Pendientes de Firmar
                            </Button>
                        </Grid>
                        <Grid item xs={6} md={6}>
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                className="mx-auto mt-32"
                                aria-label="Filtrar"
                                onClick={downloadEmployeesSign}
                            //disabled={!isContactsFormValid}
                            >
                                Descargar Lista de Empleados Firmados
                            </Button>
                        </Grid>

                    </Grid>
                )}

            </div>
        </div>
    );
}

export default XMLMockList;