import React from "react";
import styles from "./Acknowledgement.module.scss";

import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import AcknowledgementForm from "../../components/user/AcknowledgementForm/AcknowledgementForm";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";

const Acknowledgement = () => {
    const onSubmitTemp = async ({ eSignature, acknowledgeRules }) => {
        alert(JSON.stringify({ eSignature, acknowledgeRules }, null, 2));
    };

    return (
        <>
            <Header showNavbar={false} />
            <Container maxWidth="lg">
                <Paper className={styles.paper} elevation={3}>
                    <Typography className={styles.title} variant="h1">
                        ACKNOWLEDGEMENTS
                    </Typography>
                    <AcknowledgementForm
                        handleSubmit={onSubmitTemp}
                        isLoading={false}
                    />
                </Paper>
            </Container>
        </>
    );
};

export default Acknowledgement;
