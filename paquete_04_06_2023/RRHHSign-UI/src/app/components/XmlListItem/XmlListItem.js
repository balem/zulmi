import React, { useState, useEffect } from 'react';
import { IconButton, Icon, Typography, Tooltip, ListItem, Paper, Badge } from '@material-ui/core';
import ChipIcon from 'app/components/ChipIcon';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import MTESSService from "app/services/MTESSService";
import DocumentsService from 'app/services/DocumentsService';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import renderIf from "app/main/Utils/renderIf";
import { useSelector } from 'react-redux';
import moment from 'moment';
import MaterialTable from './MaterialTable';

var pfcount = 0;

const useStyles = makeStyles({
    listItem: {
        '&.completed': {
            background: 'rgba(0,0,0,0.03)',
            '& .todo-title, & .todo-notes': {
                textDecoration: 'line-through'
            }
        }
    }
});

function XmlListItem(props) {

    const classes = useStyles(props);
    const dispatchMsg = useDispatch();
    const user = useSelector(({ auth }) => auth.user);
    let userProfile = user.role[0];
    let userEmail = user.data.email;

    const [visibleEye, handlevisibleEye] = useState(true);
    const [xmlId, hanldleXmlId] = useState(props.registro[0].id)

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

    useEffect(() => {
        fetchXmlSignature(xmlId);
    }, [])

    async function fetchXmlSignature(xmlId) {
        if (userProfile == 'funcionario') {

            let responseXmlsSignature = await DocumentsService.getXmlsForEmployeeSignature(xmlId);
            //return message("success", "Documentos enviados exitosamente");
            if (responseXmlsSignature.data.status == 'error') {
                handlevisibleEye(false)
                return message("error", responseXmlsSignature.data.message)
            }
        }
    }

    async function uploadMTESS(xmlId) {
        let data = {
            user_email: userEmail,
            id: xmlId
        }
        let responseSendMTESS = await MTESSService.sendXMLToMTESS(data);

        console.log(responseSendMTESS)

        if (responseSendMTESS.status === 200) {
            if (responseSendMTESS.data.status === 'error') {
                return message("error", responseSendMTESS.data.message);
            } else {
                return message("success", "Documento enviado exitosamente!");
            }
        } else {
            return message("error", responseSendMTESS.data.message);
        }
    }

    const ViewXML = withRouter(({ history, type, id }) => (

        <Tooltip title="Vista previa" placement="top">
            <IconButton
                onClick={() => { type === 'Haberes' ? history.push('/' + props.control.data.data[0].invoice_path + `/${id}`) : history.push(`/comprobante/${id}`) }}
            >
                <Icon>remove_red_eye</Icon>
            </IconButton>
        </Tooltip>
    ));

    let data = [];

    for (var i = 0; i < props.registro.length; i++) {
        let id = props.registro[i].id;
        var rows = {
            employee: props.registro[i].third_signer,
            acciones: <div>
                {renderIf(visibleEye)(
                    <div className="flex px-1 justify-left">
                        {renderIf(props.registro[i].rejections == 0)(
                            <ViewXML id={id} type={props.registro[i].type} />
                        )}
                        {renderIf(props.registro[i].rejections > 0)(
                            <Tooltip title="XML con rechazos" placement="top">
                                <Badge
                                    color="error"
                                    badgeContent="!"
                                >
                                    <ViewXML id={id} type={props.registro[i].type} />
                                </Badge>
                            </Tooltip>
                        )}
                        {renderIf(props.registro[i].docStatus !== 'DES' && (userProfile === 'rh' && props.registro[i].second_status && props.registro[i].third_status))(
                            <Tooltip title="Enviar a MTESS" placement="top">
                                <IconButton
                                    onClick={() => { uploadMTESS(id) }}
                                >
                                    <Icon>cloud_upload</Icon>
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>,
            item: <>
                <div className="flex flex-1 flex-col relative overflow-hidden pl-8">
                    <div className={clsx(classes.labels, "flex mt-8")}>
                        {renderIf(props.registro[i].first_view)(
                            <ChipIcon
                                icon={(props.registro[i].first_status === true ? "check_circle" : "radio_button_unchecked")}
                                tooltip={(props.registro[i].first_status === true ? "Firmado: " + moment(props.registro[i].signatureRRHH).format('DD/MM/YYYY HH:mm:ss') + " por " + props.registro[i].signatureRRHHName : "NO FIRMADO")}
                                className="mr-4 z-0"
                                title={props.registro[i].first_signer}
                                color={(props.registro[i].first_status === true ? "#BBFABD" : "#F5B6AD")}
                                key={'status1'}
                            />
                        )}
                        <ChipIcon
                            icon={(props.registro[i].second_status === true ? "check_circle" : "radio_button_unchecked")}
                            tooltip={(props.registro[i].second_status === true ? "Firmado: " + moment(props.registro[i].signatureDirector).format('DD/MM/YYYY HH:mm:ss') + " por " + props.registro[i].signatureDirectorName : "NO FIRMADO")}
                            className="mr-4 z-0"
                            title={props.registro[i].second_signer}
                            color={(props.registro[i].second_status === true ? "#BBFABD" : "#F5B6AD")}
                            key={'status2'}
                        />
                        <ChipIcon
                            icon={(props.registro[i].third_status === true ? "check_circle" : "radio_button_unchecked")}
                            tooltip={(props.registro[i].third_status === true ? "Firmado: " + moment(props.registro[i].signatureEmployee).format('DD/MM/YYYY HH:mm:ss') + " por " + props.registro[i].third_signer : "NO FIRMADO")}
                            className="mr-4 z-0"
                            title={props.registro[i].third_signer}
                            color={(props.registro[i].third_status === true ? "#BBFABD" : "#F5B6AD")}
                            key={'status3'}
                        />
                        <ChipIcon
                            icon={"radio_button_unchecked"}
                            className="mr-4 z-0"
                            title={props.registro[i].type}
                            color={(props.registro[i].type === 'Haberes' ? "#1187DE" : "#19C141")}
                            key={'status3'}
                        />
                    </div>
                </div>
            </>
        }
        data.push(rows)
    }

    return (
        <MaterialTable
            key={pfcount++}
            registro={data}>
        </MaterialTable>
    )

}

export default XmlListItem;
