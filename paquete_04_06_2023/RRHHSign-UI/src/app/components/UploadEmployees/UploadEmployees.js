import React, { useState } from "react";
import DragDropZone from "app/components/DragDropZone";
import Progressbar from "app/components/Progressbar";
import { Icon, Typography, Grid, Paper, Button } from "@material-ui/core";
import "./UploadEmployees.css";
import { Store } from "app/react-store/Store";
import Moment from "moment";
import momentESLocale from "moment/locale/es";
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from "app/store/actions";
import Loader from 'app/components/Loader';
import renderIf from "app/main/Utils/renderIf";
import EmployeeService from "app/services/EmployeeService";

export default function UploadEmployees(props) {
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

    const { state, dispatch } = React.useContext(Store);

    const user = useSelector(({ auth }) => auth.user);
    var userName = user.data.email;

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

    function onFilesAdded(filesAdded) {
        handleFiles(filesAdded);
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

                    if (responses.status == 'success') {
                        showSimpleMessage('success', responses.message);
                    }else{
                        showSimpleMessage('error', responses.message);
                    }
                    
                    props.fetchEmployees()

                }else if (req.readyState === 4 && req.status === 500){
                    showSimpleMessage('error', 'Error Inesperado');
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
            formData.append("creator", userName);
            formData.append("file", file, file.name);
            
            req.open("POST", process.env.REACT_APP_API_HOST + "/employees/add-multiple");
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

    return (
        <Paper className="p-12 mt-16">
            {renderIf(showLoader)(<Loader />)}
            <Typography className="h4 mb-24">Carga Masiva de Empleados</Typography>
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
