import React from "react";
import styles from "./Header.module.scss";
import { ReactComponent as Logo } from "logo.svg";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/icons/Menu";
import Navbar from "components/general/Navbar/Navbar";
import IconButton from "@material-ui/core/IconButton";

const Header = () => (
    <AppBar className={styles.header} position="sticky">
        <Toolbar className={styles.headerToolbar}>
            <div className={`${styles.headerLogo} ${styles.headerIconDisappear}`}>
                <Logo
                    className={styles.headerLogoImg}
                    alt="Hackathon logo"
                    data-testid="headerLogo"
                />
                <Typography variant="h6">Hackathon Name</Typography>
            </div>
            <div className={`${styles.headerLogo} ${styles.headerIconReappear}`}>
                <IconButton
                    color="inherit"
                    aria-label="Menu"
                    className={styles.headerIconBtn}
                >
                    <Menu />
                </IconButton>
            </div>
            <Navbar />
        </Toolbar>
    </AppBar>
);

export default Header;
