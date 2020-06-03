import React from "react";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import styles from "./Login.module.scss";
import LoginForm from "components/user/LoginForm/LoginForm";

export const LoginPage = () => {
    return (
        <Container maxWidth="sm">
            <Paper className={styles.Paper} variant="outlined">
                <Typography className={styles.title} variant="h1">
                    LOGIN
                </Typography>
                <LoginForm />
            </Paper>
        </Container>
    );
};

export default LoginPage;
