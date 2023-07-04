import React, { useState } from 'react';
import { Paper, Grid, Button } from "@material-ui/core";
import SweetAlert from 'sweetalert2-react';

var request = require('request');

export default function WhatsappNotification() {

    const [showModal, handleShowModal] = useState(false);

    function sendNotification() {
        handleShowModal(true);

        var url = 'https://eu68.chat-api.com/instance65009/sendMessage?token=1b4gexkuzar69p2r';
        var data = {
            phone: '595991712005',
            body: 'Notificación:\nSeñor(a) acaba de recibir un documento que necesita su firma.\nTipo: Recibo de Haberes.\nEnlace: http://bepa.rrhh.magmait.com.br/login'
        };
        // Send a request
        request({
            url: url,
            method: "POST",
            json: data
        });
    }


    return (
        <React.Fragment>
            <Paper className="p-12 mt-16">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            className="mx-auto mt-32"
                            aria-label="Notificar (Enviar a Director)"
                            onClick={sendNotification}
                        >
                            Notificar (Enviar a Director)
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <SweetAlert
                show={showModal}
                title="Éxito"
                text="Director informado con éxito"
                onConfirm={() => handleShowModal(false)}
            />
        </React.Fragment>
    );
}