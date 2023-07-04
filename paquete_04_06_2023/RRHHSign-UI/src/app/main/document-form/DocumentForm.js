import { Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import VacationForm from '../../components/VacationForm/VacationForm'
import PermissionForm from '../../components/PermissionForm/PermissionForm'
import "./DocumentForm.css";
import renderIf from "../Utils/renderIf";
import * as mockData from './MockData'
import { Store } from "app/react-store/Store";
import DocumentsService from '../../services/DocumentsService'

function DocumentForm(props) {
    const { state, dispatch } = React.useContext(Store);
    
    const type = props.match.params.type
    const id = props.match.params.id
    console.log('PROPS: ', props)
    const document = DocumentsService.getDocument(id)
    console.log(document)

    useEffect(() => {
        dispatch({
            type: "SET_PERSON_COMPANY_ID",
            payload: id
        });
        dispatch({
            type: "SET_PERSON_COMPANY_TYPE",
            payload: "agent"
        });
    },[]);

    function isVacations() {
        return type === "vacations"
    }

    function saveDocument(id, document) {
        DocumentsService.updateDocument(id, document)
    }
    
    return (
        <div className="p-24 flex flex-1 justify-center">
            <div className="fullWidth">
                <Typography className="h2 mb-24">
                    Generar Documento de { isVacations() ? 'Vacaciones' : 'Permiso' }

                    {renderIf(isVacations())(
                        <VacationForm
                            id={id}
                            mockData={mockData}
                            document={document}
                            saveDocument={saveDocument}
                        />
                    )}

                    {renderIf(!isVacations())(
                        <PermissionForm
                            id={id}
                            mockData={mockData}
                            document={document}
                            saveDocument={saveDocument}
                        />
                    )}
                </Typography>
            </div>
        </div>
    );
}

export default DocumentForm;
