import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import styles from "./Footer.module.scss";

const Footer = () => {
    let fakeDate = new Date();
    const yearRange =
        fakeDate.getFullYear() === 2020 ? "" : " - " + fakeDate.getFullYear();
    const outputMessage =
        "© 2020" +
        yearRange +
        " Built by the web team at MakeUofT (University of Toronto)";

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
