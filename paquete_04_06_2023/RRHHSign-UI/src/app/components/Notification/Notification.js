import React from 'react';

export default function Notification() {

    function sendNotification() {
        console.log("SENDING NOTIFICATION");
    }


    return (
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
    );
}