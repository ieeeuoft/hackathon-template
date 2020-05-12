import React from "react";
// import "./Footer.module.scss";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import styles from "./Footer.module.scss";

const Footer = () => (
        <Container maxWidth={false} disableGutters={true}>
            <footer className={styles.footer}>
                <Typography variant="caption" display="block" gutterBottom>
                    Hardware Signout
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                    © 2020 - build by the web team at MakeUofT (University of Toronto)
                </Typography>
            </footer>
        </Container>
)
export default Footer;