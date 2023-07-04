import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { Grid, Button, Paper } from '@material-ui/core';
import './Document.css';
import { Store } from "app/react-store/Store.js";
import { useSelector } from 'react-redux';
import SweetAlert from 'sweetalert2-react';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const pages = [];

export default function DisplayDocument(props) {
	const [pageNumber, handlePageNumber] = useState(1);
	const [numPages, handleNumPages] = useState(null);
	const [showModal, handleShowModal] = useState(false);
	const [inputValue, handleInputValue] = useState('');

	const { state, dispatch } = React.useContext(Store);

	const user = useSelector(({ auth }) => auth.user);

	let username = user.data.email.split("@", 2);

	function confirmarFirmar() {
		handleShowModal(true);
	}

	function firmar() {
		if (user.role[0] === 'director') {
			dispatch({
				type: "SET_FIRMADO_DIRETOR",
				payload: true
			});
		}
		if (user.role[0] === 'rh') {
			dispatch({
				type: "SET_FIRMADO_RH",
				payload: true
			});
		}
		if (user.role[0] === 'funcionario') {
			dispatch({
				type: "SET_FIRMADO_FUNCIONARIO",
				payload: true
			});
		}
	}

	function onDocumentLoadSuccess(totalPages) {
		// var cache = [];
		// console.log(JSON.stringify(totalPages, function(key, value) {
		//   if (typeof value === "object" && value !== null) {
		//     if (cache.indexOf(value) !== -1) {
		//       // Duplicate reference found, discard key
		//       return;
		//     }
		//     // Store value in our collection
		//     cache.push(value);
		//   }
		//   return value;
		// }));
		handleNumPages(totalPages._pdfInfo.numPages);

		//console.log('numPages: ' + totalPages._pdfInfo.numPages);

		for (let index = 1; index <= totalPages._pdfInfo.numPages; index++) {
			pages[index] = index;
		}
		//console.log("pages: " + pages);
	}

	function changePage(page) {
		handlePageNumber(page);
	}

	function signedOrNot() {
		if (user.role[0] === 'director' && state.firmado_diretor === true) {
			return '2';
		} else if (user.role[0] === 'director' && state.firmado_diretor === false) {
			return '1';
		}

		if (user.role[0] === 'rh' && state.firmado_rh === true) {
			return '2';
		} else if (user.role[0] === 'rh' && state.firmado_rh === false) {
			return '1';
		}

		if (user.role[0] === 'funcionario' && state.firmado_funcionario === true) {
			return '2';
		} else if (user.role[0] === 'funcionario' && state.firmado_funcionario === false) {
			return '1';
		}

		return '1';
	}

	return (
		<React.Fragment>
			<Grid container spacing={3}>

				<Grid item xs={10} className="flex justify-center">
					<Paper>
						<Document
							file={`/assets/pdfs/${username[0]}_${signedOrNot()}.pdf`}
							onLoadSuccess={onDocumentLoadSuccess}
						>
							<Page pageNumber={pageNumber} />
						</Document>
					</Paper>
				</Grid>

				<Grid item xs={2}>
					<Button
						type="button"
						variant="contained"
						color="primary"
						className="mx-auto mt-32"
						aria-label="FIRMAR"
						onClick={confirmarFirmar}
					//disabled={!isFormValid}
					>
						Firmar
                    </Button>
				</Grid>

				{/* <Grid item xs={12} className="flex justify-center">
            <p>Página {pageNumber} de {numPages}</p>
        </Grid>
        <Grid item xs={12} className="flex justify-center pagination">
            {pages.map(page => {
                return <a onClick={pageNumber !== page ? changePage(page) : '' }>{page}</a>
            })}
        </Grid> */}
			</Grid>

			{<SweetAlert
				show={showModal}
				title="PIN de verificación"
				html='Ingrese su PIN de verificación <br> <input id="swal-input1" class="swal2-input">'
				onConfirm={() => {handleShowModal(false);firmar();}}
			/>}
		</React.Fragment>
	);
}
