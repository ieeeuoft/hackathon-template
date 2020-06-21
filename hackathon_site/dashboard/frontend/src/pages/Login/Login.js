import React from "react";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import styles from "./Login.module.scss";
import LoginForm from "components/user/LoginForm/LoginForm";
import Header from "../../components/general/Header/Header";

export const LoginPage = () => {
    return (
        <>
            <Header showNavbar={false} />
            <Container maxWidth="sm">
                <Paper className={styles.paper} elevation={3}>
                    <Typography className={styles.title} variant="h1">
                        LOGIN
                    </Typography>
                    <LoginForm />
                </Paper>
            </Container>
            <Container className={styles.cookieConsent}>
                <Typography>
                    We use cookies to provide and improve your experience. By using our
                    site, you consent to using cookies.
                </Typography>
            </Container>
        </>
    );
};

export default LoginPage;
