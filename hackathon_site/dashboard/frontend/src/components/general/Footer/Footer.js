import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import styles from "./Footer.module.scss";

const Footer = () => {
    let date = new Date();

    if (date.getFullYear() === 2020) {
        var outputMessage =
            "© 2020 - built by the web team at MakeUofT (University of Toronto)";
    } else {
        var outputMessage =
            "© 2020 - " +
            date.getFullYear() +
            " built by the web team at MakeUofT (University of Toronto)";
    }

    return (
        <Container maxWidth={false} disableGutters={true}>
            <footer className={styles.footer}>
                <Typography variant="caption" display="block" gutterBottom>
                    Hardware Signout
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                    {outputMessage}
                </Typography>
            </footer>
        </Container>
    );
};

export default Footer;
