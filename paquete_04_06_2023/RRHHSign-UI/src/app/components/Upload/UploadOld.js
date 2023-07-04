import React, { useState } from "react";
import DragDropZone from "app/components/DragDropZone";
import Progressbar from "app/components/Progressbar";
import { Icon, Typography, Grid, Paper, Button } from "@material-ui/core";
import "./Upload.css";
import { Store } from "app/react-store/Store";
import Moment from "moment";
import momentESLocale from "moment/locale/es";
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from "app/store/actions";
import Loader from 'app/components/Loader';
import renderIf from "app/main/Utils/renderIf";
import ControlService from "app/services/ControlService";


export default function Upload(props) {
    const dispatchMsg = useDispatch();

    const [files, handleFiles] = useState([]);
    const [userFiles, handleUserFiles] = useState([]);
    const [uploading, handleUploading] = useState(false);
    const [uploadProgress, handleUploadProgress] = useState({});
    const [successfullUploaded, handleSuccessfullUploaded] = useState(false);
    const [showMessage, handleShowMessage] = useState(false);
    const [message, handleMessage] = useState('');
    const [messageType, handleMessageType] = useState('info');
    const [deletedFile, handleDeletedFile] = useState(null);
    const [showLoader, setShowLoader] = useState(false);

    const [employeesNotFound, handleEmployeesNotFound] = useState([]);
    const [companiesMtessNotFound, handleCompaniesMtessNotFound] = useState([]);
    const [conceptsNotFound, handleConceptsNotFound] = useState([]);
    const [emptyRecords, handleEmptyRecords] = useState([]);

    const { state, dispatch } = React.useContext(Store);

    const user = useSelector(({ auth }) => auth.user);
    var userName = user.data.displayName;

    function showSimpleMessage(type = "null", message = "") {
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

    function renderProgress(file) {
        const upProgress = uploadProgress[file.name];
        if (uploading || successfullUploaded) {
            return (
                <div className="ProgressWrapper">
                    <Progressbar
                        progress={
                            upProgress ? upProgress.percentage : 0
                        }
                    />
                    <Icon
                        style={{
                            opacity:
                                upProgress &&
                                    upProgress.state === "done"
                                    ? 0.5
                                    : 0
                        }}
                    >
                        check_circle
                    </Icon>
                </div>
            );
        }
    }

    async function onFilesAdded(filesAdded) {
        let result = await ControlService.getEquibalent();
        if ((result.data.status == 'error') || (result.status == 404)) {
            let type = null;
            let message = "Los datos de equibalencia de los salarios no se encuentran disponibles";
            showSimpleMessage(type, message);
        } else {
            console.log('Files: ', filesAdded)
            handleFiles(filesAdded);
        }
    }

    async function uploadFiles() {
        setShowLoader(true);
        handleUploadProgress({});
        handleUploading(true);
        const promises = [];
        files.forEach(file => {
            promises.push(sendRequest(file));
        });
        try {
            await Promise.all(promises);
            handleSuccessfullUploaded(true);
            handleUploading(false);
            setShowLoader(false);
        } catch (e) {
            handleSuccessfullUploaded(true);
            handleUploading(false);
        }
    }

    function sendRequest(file) {
        
        handleShowMessage(false);
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            
            req.addEventListener("readystatechange", () => {
                console.log("status upload: "+req.status)
                if (req.readyState === 4 && req.status === 200){   

                    const responses = JSON.parse(req.response)
                    console.log(responses)

                    if(responses.RecibosFound!=''){
                        showSimpleMessage('error', 'Atención, el lote ya fue cargado!');
                    }else if (responses.EmployeesNotFound!='' || responses.ConceptsNotFound!='') {
                        showSimpleMessage('error', 'El lote no se pudo procesar correctamente, verifique el log de errores!');
                    }else{
                        showSimpleMessage('success', 'Documentos importados exitósamente!');
                    }

                }else if (req.readyState === 4 && req.status === 500){
                    showSimpleMessage('error', "El lote ya existe!");
                }
                  
              });

            req.upload.addEventListener("progress", event => {
                if (event.lengthComputable) {
                    const copy = uploadProgress;
                    copy[file.name] = {
                        state: "pending",
                        percentage: event.loaded / event.total * 100
                    };
                    handleUploadProgress(copy);
                }
            });

            req.addEventListener("load", event => {
                const copy = uploadProgress;
                copy[file.name] = { state: "done", percentage: 100 };
                
                handleUploadProgress(copy);
                const responses = req.response

                handleEmployeesNotFound(responses.EmployeesNotFound)
                handleCompaniesMtessNotFound(responses.CompaniesMtessNotFound)
                handleConceptsNotFound(responses.ConceptsNotFound)
                handleEmptyRecords(responses.EmptyRecords)
                resolve(req.response);
            });

            req.upload.addEventListener("error", event => {
                const copy = uploadProgress;
                copy[file.name] = { state: "error", percentage: 0 };
                showSimpleMessage('error', 'Error: ' + req.response.data);
                handleUploadProgress(copy);
                reject(req.response);
            });

            req.upload.onreadystatechange = () => {
                console.log('READY STATE CHANGE')
                console.log('state ', req.upload.readyState)
                console.log('status ', req.upload.status)
                if (req.upoload.readyState == 4) {
                    if (req.upload.status == 200) {
                        console.log('response ', req.upload.responseText)
                    }
                }
                showMessageFunc(req.responseText.message, 'error');
            }

            req.onreadystatechange = () => {
                showMessageFunc(req.responseText.message, 'error');
            }

            const formData = new FormData();
            formData.append("start_date", Moment(state.start_pay_date).local(momentESLocale).format('DD/MM/YYYY'));
            formData.append("end_date", Moment(state.end_pay_date).local(momentESLocale).format('DD/MM/YYYY'));
            formData.append("fecha_de_pago", Moment(state.fecha_de_pago).local(momentESLocale).format('YYYY-MM-DD'));
            formData.append("creator", userName)
            formData.append("tipo_documento", state.document_identificator)
            formData.append("file", file, file.name);

            for (var key of formData.entries()) {
                console.log(key[0] + ', ' + key[1]);
            }
            
            let uploadUrl = ''
            
            if (file.type.indexOf('pdf') > -1) {
                uploadUrl = process.env.REACT_APP_API_HOST + "/document/pdf"
            } else if (file.type == 'text/plain') {
                uploadUrl = process.env.REACT_APP_API_HOST + "/document/txt"
            } else {
                uploadUrl = process.env.REACT_APP_DOTNET_API_HOST + "/api/receivefile"
                //uploadUrl = process.env.REACT_APP_API_HOST + "/upload/recibos"
            }

            req.open("POST", uploadUrl);
            req.send(formData);
        });
    }

    function renderActions() {
        if (successfullUploaded) {
            return (
                <Button className="full-width" variant="contained" color="primary" onClick={() => { handleFiles([]); handleSuccessfullUploaded(false); }}>
                    Borrar
                </Button>
            );
        } else {
            return (
                <Button className="full-width" variant="contained" color="primary" 
                    disabled={
                        files.length < 0 || uploading
                    }
                    onClick={uploadFiles}
                >
                    Cargar
                </Button>
            );
        }
    }

    function showMessageFunc(message, type) {
        if (message !== undefined && message !== '') {
            handleShowMessage(true);
            handleMessage(message);
            handleMessageType(type);
        }
    }

    const formatErrorLines = (lines) => {
        lines = lines.map(i => i + 1)
        if (lines.length == 1) {
            return lines[0]
        }
        
        return [lines.slice(0, -1).join(', '), lines.slice(-1)].join(' y ')
    }

    return (
        <Paper className="p-12 mt-16">
            {renderIf(showLoader)(<Loader />)}
            <Typography className="h4 mb-24">Documentos</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <Paper className="p-12 mt-16">
                        <DragDropZone
                            key='DragDropZone'
                            onFilesAdded={onFilesAdded}
                            disabled={
                                uploading ||
                                successfullUploaded
                            }
                        />
                    </Paper>
                    <Paper className="p-12 mt-16">
                        <Grid className="Files" item xs={12}>
                            {files.map(file => {
                                return (
                                    <div key={file.name} className="Row">
                                        <span className="Filename">
                                            {file.name}
                                        </span>
                                        {renderProgress(file)}
                                    </div>
                                );
                            })}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid className="Actions" item xs={12}>
                    {renderActions()}
                </Grid>
            </Grid>
        </Paper>
    );
}
