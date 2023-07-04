import { SelectFormsy, TextFieldFormsy } from "@fuse";
import {
    MenuItem,
    Typography,
    Grid,
    Paper,
    Button
} from "@material-ui/core";
import Formsy from "formsy-react";
import React, { useState, useEffect } from "react";
import DocumentListItem from "app/components/DocumentListItem";
import "./DocumentList.css";
import { KeyboardDatePicker, DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import esLocale from "date-fns/locale/es";
import Widget from "../widgets/Widget";
import { FuseAnimateGroup } from '@fuse';
import DocumentService from './../../services/DocumentsService/index';
import EmployeeService from './../../services/EmployeeService/index';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import { useSelector } from 'react-redux';
import renderIf from "../Utils/renderIf";
import ModernInvoicePage from "../invoice/ModernInvoicePage";
import XmlService from "app/services/XmlService";
import UserService from 'app/services/UserService';

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ControlService from "app/services/ControlService";
import UserGroupService from "app/services/UserGroupService";

var pfcount = 0;

function DocumentList() {
    const dispatchMsg = useDispatch();

    const user = useSelector(({ auth }) => auth.user);
    let userEmail = user.data.email;
    let mostrar = user.data.mostrar;
    let userProfile = user.role[0];
    let startDateVal = new Date();
    let endDateVal = new Date();

    startDateVal.setMonth(endDateVal.getMonth() - mostrar)
    startDateVal.setDate(1)

    endDateVal.setMonth(endDateVal.getMonth() + 1)
    endDateVal.setDate(0)
    // endDateVal.setFullYear(2020)

    const [open, setOpen] = useState(false);
    const [password, handlePassword] = useState('');
    const [status, handleStatus] = useState('T');
    const [creator, handleCreator] = useState('');
    const [startDate, handleStartDateChange] = useState(startDateVal);
    const [endDate, handleEndDateChange] = useState(endDateVal);
    const [documentList, handleDocumentList] = useState([]);
    const [visibleDocuments, handleVisibleDocuments] = useState([]);
    const [actualPage, handleActualPage] = useState(0);
    const [pageRefreshCount, handlePageRefreshCount] = useState(0);
    const [xmlList, handleXmlList] = useState([]);
    const [docsPendentes, handleDocsPendentes] = useState(0);
    const [docsEnProceso, handleDocsEnProceso] = useState(0);
    const [docsCompletado, handleDocsCompletado] = useState(0);
    const [docsCompletadoTardio, handleDocsCompletadoTardio] = useState(0);
    const [docsDesactivado, handleDocsDesactivado] = useState(0);
    const [control, handleControl] = useState(false);
    const [sucursalGroup, handleSucursalGroup] = useState([]);
    const [sucursal, handleSucursal] = useState(0);

    const [generatePdfs, handleGeneratePdfs] = useState(false)

    const DOCUMENTS_PER_PAGE = 10;

    function message(type = "null", message = "") {
        dispatchMsg(
            Actions.showMessage({
                message: message,
                autoHideDuration: 4000, //ms
                anchorOrigin: {
                    vertical: "top", //top bottom
                    horizontal: "center" //left center right
                },
                variant: type //success error info warning null
            })
        );
    }

    useEffect(() => {
        async function GetDocumentCount() {
            var responseEmployee = await EmployeeService.getEmployeeWithUserByEmail(userEmail);
            console.log(responseEmployee);
            let employeeId = null

            if (user.role[0] == 'funcionario') {
                employeeId = responseEmployee.data.data[0].id_emp
            }

            var responseDocsPendentes = await DocumentService.GetDocumentCountByStatus('PEN', employeeId);
            var responseDocsEnProceso = await DocumentService.GetDocumentCountByStatus('ENP', employeeId);
            var responseDocsCompletado = await DocumentService.GetDocumentCountByStatus('COM', employeeId);
            //var responseDocsCompletadoTardio = await DocumentService.GetDocumentCountByStatus('TAR', employeeId);
            var responseDocsCompletadoDesactivado = await DocumentService.GetDocumentCountByStatus('DES', employeeId);

            if (userProfile == 'funcionario') {
                responseDocsEnProceso = 1;
            }
            if (responseDocsPendentes.status === 200) {
                handleDocsPendentes(responseDocsPendentes.data);
            }
            if (responseDocsEnProceso.status === 200) {
                handleDocsEnProceso(responseDocsEnProceso.data);
            }
            if (responseDocsCompletado.status === 200) {
                handleDocsCompletado(responseDocsCompletado.data);
            }
            /*  if (responseDocsCompletadoTardio.status === 200) {
                handleDocsCompletadoTardio(responseDocsCompletadoTardio.data);
            } */
            if (responseDocsCompletadoDesactivado.status === 200) {
                handleDocsDesactivado(responseDocsCompletadoDesactivado.data);
            }
        }

        async function checkChangePwd() {
            const changePwd = await UserService.checkChangePwd(userEmail)
            console.log('change pwd: ', changePwd)

            if (changePwd.data.data && changePwd.data.data.change_pwd) {
                setOpen(true)
            }
        }
        getControl();
        groupLoad();
        GetDocumentCount();
        checkChangePwd();
        filtrar2();
    }, []);

    const updatePage = (page) => {
        console.log('New selected Page: ', page)
        handleActualPage(page)
    }

    const updateVisibleDocuments = (forcePage) => {
        const start = (forcePage ? forcePage : actualPage) * DOCUMENTS_PER_PAGE
        const newVisibleDocuments = documentList.slice(start, (start + DOCUMENTS_PER_PAGE))
        console.log('start: ', start)
        console.log('Visible employees arr: ', newVisibleDocuments)
        handleVisibleDocuments(newVisibleDocuments)
    }

    useEffect(() => {
        handlePageRefreshCount(pageRefreshCount + 1)
    }, [documentList])

    useEffect(() => {
        updateVisibleDocuments()
    }, [actualPage, pageRefreshCount])

    useEffect(() => {
        if (generatePdfs) {
            let counter = 0
            let newXmllist = []
            handleXmlList([]);
            documentList.filter(doc => doc.Selected)
                .forEach(async (doc) => {
                    const responseXmls = await XmlService.getXmls(doc.Id);
                    if (responseXmls) {
                        counter++
                        if (responseXmls.status == 200) {
                            console.log('status 200')
                            const newIds = responseXmls.data.map(xml => xml.xml.id)
                            newXmllist = newXmllist.concat(newIds)
                        }
                        if (documentList.filter(doc => doc.Selected).length == counter) {
                            handleXmlList(newXmllist)
                            message('success', 'Su descarga comienza en 5 segundos');
                            setTimeout(() => {
                                window.print()
                            }, 4000);
                        }
                    }
                })
            handleGeneratePdfs(false);
        }
    }, [generatePdfs])

    async function getControl() {
        let data = await ControlService.getControl();
        handleControl(data.data.data[0].sucursal);
    }

    async function getSigning() {
        var signning = await ControlService.getControlSigners();
        return signning.data.data;
    }

    async function groupLoad() {
        let data = await UserGroupService.getGroup();
        data.data.data.push({ id: 'ALL', name: 'TODOS' });
        handleSucursalGroup(data.data.data);
    }

    async function handleCancelClose() {
        setOpen(false);
    }

    const handleClose = async () => {
        const changePwdRes = await UserService.changePassword(userEmail, password)
        if (changePwdRes.data && changePwdRes.data.status == 'success') {
            message('success', changePwdRes.data.data)
        } else {
            message('error', 'Error al actualizar la contraseña')
        }
        setOpen(false);
    }

    async function filtrar() {
        let filter = {
            start_date: startDate,
            end_date: endDate,
            status: status,
            creator: creator
        };
        //BUSCA O EMPREGADO DO USUÁRIO LOGADO, SE FOR DO TIPO FUNCIONARIO
        //SE NÃO FOR, BUSCA TODOS OS DOCS MESMO
        var responseEmployee = await EmployeeService.getEmployeeWithUserByEmail(userEmail);
        //console.log("EMPLOYEE: " + JSON.stringify(responseEmployee));
        let documents;
        if (responseEmployee.data.data[0]) {
            if (userProfile === 'funcionario') {
                filter.employeeId = responseEmployee.data.data[0].id_emp;
                documents = await DocumentService.GetDocumentsForEmployee(filter);
            } else {
                documents = await DocumentService.getDocuments(filter);
            }

            if (documents.status !== 200 || (documents.status === 200 && documents.data === "No se encontraron documentos")) {
                message("error", documents.data);
                handleDocumentList([]);
            } else {
                if (documents.data.length > 0) {
                    let docsList = documents.data.map(async doc => {
                        let totalXmls = 0
                        let signedXmls = 0
                        const responseXmls = await XmlService.getXmls(doc.id)
                        if (responseXmls) {
                            /*if (responseXmls.status == 200) {
                                const signedXmlsArray = responseXmls.data.map(xml => (
                                        xml.xml.signatureRRHH === true
                                        && xml.xml.signatureDirector === true
                                        && xml.xml.signatureEmployee === true
                                    )
                                )
                                totalXmls = signedXmlsArray.length
                                signedXmls = signedXmlsArray.filter(signed => signed === true).length
                            }*/
                            if (userProfile == 'funcionario') {
                                totalXmls = 1;
                                let firmado = await XmlService.getXmlsForEmployee(doc.id, userEmail);
                                if (firmado.data[0].xml.signatureEmployee) {
                                    signedXmls = 1;
                                } else {
                                    signedXmls = 0;
                                }
                            } else {
                                totalXmls = await XmlService.getXmlsCount(doc.id)
                                signedXmls = await XmlService.getXmlsFirmado(doc.id)
                            }
                            let processedDoc = {
                                Id: doc.id,
                                Status: checkStatus(doc.status),
                                StartDate: moment(doc.startDate).local(momentESLocale).format("DD/MM/YYYY"),
                                EndDate: moment(doc.endDate).local(momentESLocale).format("DD/MM/YYYY"),
                                Creator: doc.creator,
                                Selected: false,
                                TotalXmls: totalXmls,
                                SignedXmls: signedXmls,
                            }
                            return processedDoc;
                        }
                    });
                    Promise.all(docsList).then(data => handleDocumentList(data))
                }
            }
        }
    }

    async function filtrar2() {
        let filter = {
            start_date: startDate,
            end_date: endDate,
            status: status,
            group: sucursal,
            creator: creator
        };
        //BUSCA O EMPREGADO DO USUÁRIO LOGADO, SE FOR DO TIPO FUNCIONARIO
        //SE NÃO FOR, BUSCA TODOS OS DOCS MESMO
        var responseEmployee = '';
        let signning = await getSigning();
        responseEmployee = await EmployeeService.getEmployeeWithUserByEmail(userEmail);
        console.log("EMPLOYEE: " + JSON.stringify(responseEmployee.data));
        let documents;
        if (responseEmployee.data.data[0]) {
            if (userProfile === 'funcionario') {
                filter.employeeId = responseEmployee.data.data[0].id_emp;
                if ((filter.status == '') || (filter.status == 'T')) {
                    filter.status = 'ENP'
                } 
                documents = await DocumentService.GetDocumentsForEmployee(filter);
            } else {
                /* if ((filter.status != 'T') && (filter.status != 'PEN') && (filter.status != 'ENP') && (filter.status != 'COM')  && (filter.status != 'DES')) {
                    let found = false;
                    for (let i = 0; i < signning.length; i++) {
                        if (signning[i].sign_name == 'RH') {
                            found = true;
                        }
                    }
                    filter.status = 'ENP';
                    if (found === false) {
                        if (userProfile === 'diretor'){
                            filter.status = 'PEN';
                        }
                    } 
                } else  */
                if (((userProfile === 'director') || (userProfile === 'diretor')) && (filter.status == 'T')) {
                    let found = false;
                    for (let i = 0; i < signning.length; i++) {
                        if (signning[i].sign_name == 'RH') {
                            found = true;
                        }
                    }
                    filter.status = 'ENP';
                    if (found === false) {
                        if ((userProfile === 'director') || (userProfile === 'diretor')) {
                            filter.status = 'PEN';
                        }
                    }
                }
                documents = await DocumentService.getDocuments(filter);
            }
            if (documents.status !== 200 || (documents.status === 200 && documents.data === "No se encontraron documentos")) {
                message("error", documents.data);
                handleDocumentList([]);
            } else {
                if (documents.data.length > 0) {
                    let docsList = documents.data.map(async doc => {
                        let totalXmls = 0
                        let signedXmls = 0
                        let responseXmls
                        if (userProfile === 'funcionario') {
                            responseXmls = await XmlService.getXmlsForEmployee(doc.id, userEmail)
                        } else {
                            //responseXmls = await XmlService.getXmls(doc.id)
                        }
                        if (responseXmls) {
                            if (responseXmls.status == 200) {
                                const signedXmlsArray = responseXmls.data.map(xml => (
                                    // xml.xml.signatureRRHH === true
                                    xml.xml.signatureDirector === true
                                    && xml.xml.signatureEmployee === true
                                )
                                )
                                if (userProfile == 'funcionario') {
                                    totalXmls = 1;
                                    let firmado = await XmlService.getXmlsForEmployee(doc.id, userEmail);
                                    if (firmado.data[0].xml.signatureEmployee) {
                                        signedXmls = 1;
                                    } else {
                                        signedXmls = 0;
                                    }
                                } else {
                                    totalXmls = await XmlService.getXmlsCount(doc.id)
                                    signedXmls = await XmlService.getXmlsFirmado(doc.id)
                                }
                                //totalXmls = signedXmlsArray.length
                                //signedXmls = signedXmlsArray.filter(signed => signed === true).length
                            }
                            let processedDoc = {
                                Id: doc.id,
                                Status: checkStatus(userProfile === 'funcionario' ? (signedXmls < totalXmls ? 'ENP' : 'COM') : doc.status),
                                StartDate: moment(doc.startDate).local(momentESLocale).format("DD/MM/YYYY"),
                                EndDate: moment(doc.endDate).local(momentESLocale).format("DD/MM/YYYY"),
                                Creator: doc.creator,
                                Selected: false,
                                TotalXmls: totalXmls,
                                SignedXmls: signedXmls,
                                CreatedAt: moment(doc.createdAt).local(momentESLocale).format("DD/MM/YYYY")
                            }
                            return processedDoc;
                        } else {
                            if (documents.data.length > 0) {
                                totalXmls = await XmlService.getXmlsCount(doc.id)
                                signedXmls = await XmlService.getXmlsFirmado(doc.id)
                                //totalXmls = signedXmlsArray.length
                                //signedXmls = signedXmlsArray.filter(signed => signed === true).length
                            }
                            let processedDoc = {
                                Id: doc.id,
                                Status: checkStatus(userProfile === 'funcionario' ? (signedXmls < totalXmls ? 'ENP' : 'COM') : doc.status),
                                StartDate: moment(doc.startDate).local(momentESLocale).format("DD/MM/YYYY"),
                                EndDate: moment(doc.endDate).local(momentESLocale).format("DD/MM/YYYY"),
                                Creator: doc.creator,
                                Selected: false,
                                TotalXmls: totalXmls,
                                SignedXmls: signedXmls,
                                CreatedAt: moment(doc.createdAt).local(momentESLocale).format("DD/MM/YYYY")
                            }
                            return processedDoc;
                        }
                    });

                    Promise.all(docsList).then(data => handleDocumentList(data))
                    
                    Promise.all(docsList).then(data => {
                        let datos = []
                        let newFilteredDocs = []
                        let count = 0;
                        if (user.role[0] == 'funcionario') {
                            let filteringFinished = false
                            for (let i = 0; i < data.length; i++) {
                                console.log(data[i])
                                count++
                                if (!filteringFinished) {
                                    newFilteredDocs.push(data[i])
                                    if (data[i].SignedXmls == 0) {
                                        filteringFinished = true
                                    }
                                } 
                                
                            }
                            console.log("recibos para mostrar"+count);
                        }

                    })
                }
            }
        }
        updatePage(0)
    }

    function downloadDocumentsZip() {
        const ids = documentList.filter(doc => doc.Selected).map(doc => doc.Id)
        if (ids.length > 0) {
            window.open(DocumentService.downloadFilesUrl(ids))
        }
    }

    function downloadDocumentsPdfs() {
        handleGeneratePdfs(false)
        handleGeneratePdfs(true)
    }

    function checkStatus(status) {
        switch (status) {
            case 'PEN':
                return 'Pendiente';
            case 'COM':
                return 'Completado';
            case 'ENP':
                return 'En Proceso';
            case 'DES':
                return 'Desactivado';
            default:
                break;
        }
    }

    const toggleDocSelect = (selectedDoc) => {
        const docsList = [...documentList]
        const index = docsList.findIndex(doc => doc.Id == selectedDoc.id)
        const actualDoc = docsList[index]
        actualDoc.Selected = !actualDoc.Selected
        docsList[index] = actualDoc
        handleDocumentList(docsList)
    }

    return (
        <div className="p-24 flex flex-1 flex-center">
            <div className="fullWidth hidden-print">
                {(renderIf(user.role[0] == 'rh'))(
                    <Paper className="p-12">
                        <FuseAnimateGroup
                            className="flex flex-wrap"
                            enter={{
                                animation: "transition.slideUpBigIn"
                            }}
                        >
                            <div className="flex flex-1 p-12">
                                <Widget value={docsPendentes} color='blue' label='PENDIENTES' />
                            </div>
                            <div className="flex  flex-1  p-12">
                                <Widget value={docsEnProceso} color='green' label='EN PROCESO' />
                            </div>
                            <div className="flex  flex-1  p-12">
                                <Widget value={docsCompletado} color='yellow' label='COMPLETADOS' />
                            </div>
                            <div className="flex  flex-1  p-12">
                                <Widget value={docsDesactivado} color='red' label='DESACTIVADOS' />
                            </div>
                            {/* <div className="flex sm:w-1/2 md:w-1/5 p-12">
                            <Widget value={docsCompletadoTardio} color='red' label='COMPLETADO TARDIO' />
                        </div> */}
                        </FuseAnimateGroup>
                    </Paper>
                )}
                <Typography className="h1 mb-24 mt-24">
                    Lotes de Documentos Disponibles
                </Typography>
                <Formsy //onValidSubmit={handleSubmit}
                    //onValid={enableButton}
                    //onInvalid={disableButton}
                    //ref={formRef}
                    className="flex flex-col justify-center">
                    <Paper className="p-12">
                        <Typography className="h4 mb-24">Filtros</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                {(renderIf(user.role[0] == 'rh'))(
                                    <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        name="status"
                                        label="Estados"
                                        value={user.role[0] === 'rh' ? 'T' : user.role[0] === 'funcionario' ? 'ENP' : 'PEN'}
                                        onChange={e => handleStatus(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione uno"
                                        required
                                    >
                                        <MenuItem value="T">
                                            <em>Todos</em>
                                        </MenuItem>
                                        <MenuItem value="PEN">
                                            Pendientes
                                        </MenuItem>
                                        <MenuItem value="ENP">
                                            En Processo
                                        </MenuItem>
                                        <MenuItem value="COM">
                                            Completado
                                        </MenuItem>
                                        <MenuItem value="DES">
                                            Desactivado
                                        </MenuItem>
                                    </SelectFormsy>
                                )}
                                {(renderIf(user.role[0] == 'funcionario'))(
                                    <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        name="status"
                                        label="Estados"
                                        value={user.role[0] === 'rh' ? 'T' : user.role[0] === 'funcionario' ? 'ENP' : 'PEN'}
                                        onChange={e => handleStatus(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione uno"
                                        required
                                    >
                                        <MenuItem value="ENP">
                                            En Processo
                                        </MenuItem>
                                        <MenuItem value="COM">
                                            Completado
                                        </MenuItem>
                                    </SelectFormsy>
                                )}

                                {(renderIf(user.role[0] == 'director'))(
                                    <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        name="status"
                                        label="Estados"
                                        value={user.role[0] === 'rh' ? 'T' : user.role[0] === 'funcionario' ? 'ENP' : 'PEN'}
                                        onChange={e => handleStatus(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione uno"
                                        required
                                    >
                                        <MenuItem value="PEN">
                                            Pendientes
                                        </MenuItem>
                                        <MenuItem value="ENP">
                                            En Processo
                                        </MenuItem>
                                        <MenuItem value="COM">
                                            Completado
                                        </MenuItem>
                                    </SelectFormsy>
                                )}
                                <TextFieldFormsy
                                    className="mb-16"
                                    type="text"
                                    name="creator"
                                    label="Creador"
                                    onChange={e => handleCreator(e.target.value)}
                                    validations={{
                                        minLength: 3
                                    }}
                                    validationErrors={{
                                        minLength:
                                            "La longitud mínima del carácter es 3"
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6} className="alignRight">
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <KeyboardDatePicker
                                        className="mb-16"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        label="Fecha Inicial"
                                        openTo="year"
                                        format="dd/MM/yyyy"
                                        views={["year", "month", "date"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                                <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={esLocale}
                                >
                                    <KeyboardDatePicker
                                        className="mb-16"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        label="Fecha Final"
                                        openTo="year"
                                        format="dd/MM/yyyy"
                                        views={["year", "month", "date"]}
                                        fullWidth
                                        required
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            {(renderIf((user.role[0] == 'rh' || (user.role[0] == 'director')) && control))(
                                <Grid item xs={12} md={6} className="alignRight">
                                    <SelectFormsy
                                        className="mb-16 fullWidthSelect"
                                        name="sucursal"
                                        label="Sucursal"
                                        value={sucursal}
                                        onChange={e => handleSucursal(e.target.value)}
                                        //validations="isNotEqualToNone"
                                        validationError="Seleccione uno"
                                        required
                                    >
                                        {sucursalGroup.map(group =>
                                            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                                        )}
                                    </SelectFormsy>
                                </Grid>
                            )}
                            <Grid item xs={12} className="alignRight">
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={filtrar2}
                                //disabled={!isContactsFormValid}
                                >
                                    Filtrar
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Formsy>

                <Paper className="p-12 mt-16">
                    <Typography className="h2 mb-24">Resultados</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            {visibleDocuments.map(document => {
                                console.log(document)
                                var reg = {
                                    id: document.Id,
                                    creador: document.Creator,
                                    fecha_inicial: document.StartDate,
                                    fecha_final: document.EndDate,
                                    status: document.Status,
                                    selected: document.Selected,
                                    totalXmls: document.TotalXmls,
                                    signedXmls: document.SignedXmls,
                                    createdAt: document.CreatedAt
                                }
                                return (<DocumentListItem key={pfcount++} registro={reg} updateFunction={filtrar} toggleDocSelect={toggleDocSelect} />);
                            })}
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <ul className="pagination">
                                {Array.from(Array(Math.ceil(documentList.length / DOCUMENTS_PER_PAGE)).keys()).map(page =>
                                    <li key={page} className={page == actualPage ? 'active' : ''} onClick={() => updatePage(page)}>
                                        {page + 1}
                                    </li>
                                )
                                }
                            </ul>

                        </Grid>
                    </Grid>

                    {(renderIf(documentList.length > 0 && user.role[0] == 'rh'))(
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={downloadDocumentsZip}
                                //disabled={!isContactsFormValid}
                                >
                                    Descargar XMLs
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mx-auto mt-32"
                                    aria-label="Filtrar"
                                    onClick={downloadDocumentsPdfs}
                                //disabled={!isContactsFormValid}
                                >
                                    Descargar PDFs
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </Paper>
            </div>
            {renderIf(xmlList.length > 0)(
                <div className="only-print">
                    {xmlList.map(id => <ModernInvoicePage match={{ params: { id } }} history={{ goBack: () => { } }} />)}
                </div>
            )}
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Cambiar Contraseña</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Por favor, ingrese su nueva contraseña en el campo de texto.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="password"
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={e => handlePassword(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Cambiar Contraseña
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DocumentList;
