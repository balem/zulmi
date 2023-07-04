import React from "react";

export const Store = React.createContext();

const initialState = {
    registered_person_company_id: null,
    registered_person_company_type: null,
    firmado: false,
    start_pay_date: new Date(),
    end_pay_date: new Date(),
    document_identificator: '',
    document_observation: '',
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_PERSON_COMPANY_ID":
            return { ...state, registered_person_company_id: action.payload };
        case "SET_PERSON_COMPANY_TYPE":
            return { ...state, registered_person_company_type: action.payload };
        case "SET_FIRMADO_DIRETOR":
            return { ...state, firmado_diretor: action.payload };
        case "SET_FIRMADO_RH":
            return { ...state, firmado_rh: action.payload };
        case "SET_FIRMADO_FUNCIONARIO":
            return { ...state, firmado_funcionario: action.payload };
        case "CHANGE_START_PAY_DATE":
            return { ...state, start_pay_date: action.payload };
        case "CHANGE_END_PAY_DATE":
            return { ...state, end_pay_date: action.payload };
        case "SET_DOCUMENT_IDENTIFICATOR":
            return { ...state, document_identificator: action.payload };
        case "SET_DOCUMENT_OBSERVATION":
            return { ...state, document_observation: action.payload };
        case "SET_DOCUMENT_FECHA_PAGO":
            return { ...state, fecha_de_pago: action.payload };
        default:
            return state;
    }
}

export function StoreProvider(props) {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const value = {
        state: state,
        dispatch: dispatch
    };
    return (
        <Store.Provider value={value}>
            {props.children}
        </Store.Provider>
    );
}
