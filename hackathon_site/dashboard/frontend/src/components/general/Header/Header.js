import React from "react";
import styles from "./Header.module.scss";
import { ReactComponent as Logo } from "logo.svg";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import Menu from "@material-ui/icons/Menu";
import { Navbar, NavbarDrawer } from "components/general/Navbar/Navbar";
import { userEmail } from "testing/mockData";

const HackathonTitle = () => (
    <>
        <Logo
            className={styles.headerLogoImg}
            alt="Hackathon logo"
            data-testid="headerLogo"
        />
        <Typography variant="h6" data-testid="hackathonName">
            Hackathon Name
        </Typography>
    </>
);

const Header = ({ showNavbar = true }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const toggleMenu = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <AppBar className={styles.header} position="sticky">
            <Toolbar className={styles.headerToolbar}>
                <Hidden implementation="css" smDown={!!showNavbar}>
                    <div className={styles.headerLogo}>
                        <HackathonTitle />
                    </div>
                </Hidden>
                <Hidden implementation="css" mdUp>
                    {showNavbar && (
                        <IconButton
                            color="inherit"
                            aria-label="Menu"
                            className={styles.headerIconBtn}
                            onClick={toggleMenu}
                        >
                            <Menu />
                        </IconButton>
                    )}
                </Hidden>
                {showNavbar && <Navbar />}

                <Drawer
                    anchor="left"
                    open={mobileOpen}
                    onClose={toggleMenu}
                    className={styles.headerDrawer}
                >
                    <div className={styles.headerDrawerTop}></div>
                    <div className={styles.headerDrawerHackathon}>
                        <HackathonTitle />
                        <Typography variant="body2">{userEmail}</Typography>
                    </div>
                    <div className={styles.headerDrawerDivider}></div>
                    <NavbarDrawer />
                </Drawer>
            </Toolbar>
        </AppBar>
    );
};
export default Header;
