import {
    Typography,
    Grid,
    Paper,
    IconButton,
    Button
} from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import React, { useState, useEffect } from "react";
import ReactTable from "react-table";
import "./XML.css";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Store } from "app/react-store/Store.js";
import DocumentsService from './../../services/DocumentsService/index';
import EmployeeService from './../../services/EmployeeService/index';
import CompanyService from './../../services/CompanyService/index';
import SignatureService from './../../services/SignatureService/index';
import XmlService from './../../services/XmlService/index';
import moment from 'moment';
import momentESLocale from "moment/locale/es";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDispatch } from "react-redux";
import * as Actions from "app/store/actions";
import aes256 from 'aes256';

/*var mockList = [
    {
        id: '123456789',
        first_signer: "Elisabeth Aguilar",
        first_status: "Firmado",
        second_signer: "Magno Oliveira",
        second_status: "Firmado",
        third_signer: "Orlando Lafuente",
        third_status: "No Firmado"
    }
];*/

let emptyDoc = {
    startDate: '',
    endDate: '',
    employees: 0,
    xmls: 0,
    creator: ''
}

function XML(props) {
    const dispatchMsg = useDispatch();

    const { state, dispatch } = React.useContext(Store);
    const user = useSelector(({ auth }) => auth.user);
    let email = user.data.email;
    let userProfile = user.role[0];

    const [xmlId, handleXmlId] = useState(props.match.params.id);
    const [xml, handleXml] = useState([]);
    const [employee, handleEmployee] = useState([]);

    const [open, setOpen] = useState(false);
    const [pin, handlePin] = useState('');

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
        async function fetchEmployee() {
            let responseEmployees = await EmployeeService.getEmployeeByUserEmail(email);
            console.log("EMPS: " + JSON.stringify(responseEmployees));

            if (responseEmployees.status === 200) {
                handleEmployee(responseEmployees.data[0].employee);
            }
        }
        fetchEmployee();
    }, [email]);

    useEffect(() => {
        async function fetchXml() {

            let responseXmls = await XmlService.getXmlById(xmlId);
            let responseCompany = await CompanyService.getCompany();
            let responseXmlDetails = await XmlService.getXmlDetails(xmlId);


            console.log("XMLS: " + JSON.stringify(responseXmls));
            // console.log("COMP: " + JSON.stringify(responseCompany));
            // console.log("DETA: " + JSON.stringify(responseXmlDetails));

            let processedXml = {
                empleador: '',
                ips_patronal: '',
                nombres_apellidos: '', //responseXml.data[0].xmlName,
                mes_de_pago: moment('2020-01-01').local(momentESLocale).format('MMM YYYY'),
                haberes: '',
                descuentos: '',
                total_haberes: '',
                total_descuentos: '',
                total_neto: '',
                neto_en_letras: ''
                /*startDate: moment(responseDocuments.data[0].startDate).format('DD/MM/YYYY'),
                endDate: moment(responseDocuments.data[0].endDate).format('DD/MM/YYYY'),
                employees: responseEmployees.data,
                xmls: responseXmls.data,
                creator: responseDocuments.data[0].creator*/
            }

            // console.log("DOC", JSON.stringify(doc));

            handleXml(processedXml);
        }

        fetchXml();
    }, [xmlId]);

    function handleClickOpen() {
        setOpen(true);
    }

    async function handleClose() {
        setOpen(false);
        if (pin != "") {
            //CHAMA API PARA SALVAR
            var key = process.env.REACT_APP_KEY_PASS;
            var email = aes256.encrypt(key, email.toLowerCase().trim());
            var pinc = aes256.encrypt(key, pin);
            let resultSignature = await SignatureService.sign(pinc, email, userProfile, xmlId);

            if (resultSignature.status === 200) {
                //VERIFICAR STATUS
                if (resultSignature.data.status === "sucesso") {
                    message("success", "Deu certo!");
                } else {
                    message("error", resultSignature.data.data);
                }
            } else {
                //ERRO
                message("error", resultSignature.data.data);
            }

            handlePin("");
        }
    }

    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h1 mb-24">Recibo de Haberes - {xml.mes_de_pago}</Typography>
                <Paper className="p-12">
                    <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                        FIRMAR
                    </Button>
                </Paper>
            </div>

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Para firmar el documento, debe proporcionar su PIN de certificado digital.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="pin"
                        label="PIN"
                        type="password"
                        onChange={e => handlePin(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Firmar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default XML;
