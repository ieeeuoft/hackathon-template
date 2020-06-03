import React from "react";
import styles from "./Header.module.scss";
import { ReactComponent as Logo } from "logo.svg";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Menu from "@material-ui/icons/Menu";
import Navbar from "components/general/Navbar/Navbar";

const Header = () => (
    <AppBar className={styles.header} position="sticky">
        <Toolbar className={styles.headerToolbar}>
            <Hidden implementation="css" smDown>
                <div className={styles.headerLogo}>
                    <Logo
                        className={styles.headerLogoImg}
                        alt="Hackathon logo"
                        data-testid="headerLogo"
                    />
                    <Typography variant="h6" data-testid="hackathonName">
                        Hackathon Name
                    </Typography>
                </div>
            </Hidden>
            <Hidden implementation="css" mdUp>
                <IconButton
                    color="inherit"
                    aria-label="Menu"
                    className={styles.headerIconBtn}
                >
                    <Menu />
                </IconButton>
            </Hidden>
            <Navbar />
        </Toolbar>
    </AppBar>
);

export default Header;
