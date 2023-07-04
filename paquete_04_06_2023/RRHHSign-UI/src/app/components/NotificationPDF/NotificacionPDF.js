import React, { useState } from "react";
import DragDropZone from "app/components/DragDropZone";
import Progressbar from "app/components/Progressbar";
import { Icon, Typography, Grid, Paper, Button } from "@material-ui/core";
import "./NotificacionPDF.css";
//import { Store } from "app/react-store/Store";
import Moment from "moment";
import momentESLocale from "moment/locale/es";
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from "app/store/actions";
import Loader from 'app/components/Loader';
import renderIf from "app/main/Utils/renderIf";
import ControlService from "app/services/ControlService";

export default function NotificacionPDF(props) {
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
    const userEmail = useSelector(({ auth }) => auth.user.data.email);
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
        console.log('Files: ', filesAdded)
        handleFiles(filesAdded);
    }

    async function uploadFiles() {
        setShowLoader(true);
        handleUploadProgress({});
        handleUploading(true);
        const promises = [];
        files.forEach(file => {
            if (file.size <= 6000000) {
                promises.push(sendRequest(file));
            } else {
                showSimpleMessage('error', 'Error de tamaño de archivo, el mismo no puede superar los 6Mb');
            }
        });
        try {
            await Promise.all(promises).then(result => {
                handleSuccessfullUploaded(true);
                handleUploading(false);
                setShowLoader(false);
            });
        } catch (e) {
            handleSuccessfullUploaded(true);
            handleUploading(false);
        }
    }

    
    function sendRequest(file) {

        handleShowMessage(false);
        return new Promise(async (resolve, reject) => {
            const req = new XMLHttpRequest();

            var result = await req.upload.addEventListener("progress", event => {
                if (event.lengthComputable) {
                    const copy = uploadProgress;
                    copy[file.name] = {
                        state: "pending",
                        percentage: event.loaded / event.total * 100
                    };
                    handleUploadProgress(copy);
                }
            });
            console.log(result);
            req.addEventListener("load", event => {
                const copy = uploadProgress;
                copy[file.name] = { state: "done", percentage: 100 };
                showSimpleMessage('success', 'Documentos importados exitósamente!');
                handleUploadProgress(copy);
                console.log(req.response)
                const responses = JSON.parse(req.response)
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
            formData.append("userGroup", props.state.userGroup);
            formData.append("selectedStartDate", props.state.selectedStartDate);
            formData.append("titulo", props.state.titulo);
            formData.append("texto", props.state.texto);
            formData.append("creator", userEmail);
            
            if (file != '') {
                formData.append("file", file);
            } else {
                formData.append("file", '');
            }
            for (var key of formData.entries()) {
                console.log(key[0] + ', ' + key[1]);
            }

            let uploadUrl = ''

            if (file.type.indexOf('pdf') > -1) {
                uploadUrl = process.env.REACT_APP_API_HOST + "/signature-notificaciones/newpdf"
            }/*  else if (file.type == 'text/plain') {
                uploadUrl = process.env.REACT_APP_API_HOST + "/document/txt"
            } else {
                uploadUrl = process.env.REACT_APP_DOTNET_API_HOST + "/api/receivefile"
            } */

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
