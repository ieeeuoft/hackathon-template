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
import CloseIcon from "@material-ui/icons/Close";
import Navbar from "components/general/Navbar/Navbar";
import { userEmail, cartQuantity } from "testing/mockData";
import { hackathonName } from "constants.js";

const HackathonTitle = () => (
    <>
        <Logo
            className={styles.headerLogoImg}
            alt="Hackathon logo"
            data-testid="headerLogo"
        />
        <Typography variant="h6" data-testid="hackathonName">
            {hackathonName}
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
                {showNavbar && (
                    <Hidden mdUp>
                        <IconButton
                            color="inherit"
                            aria-label="Menu"
                            className={styles.headerIconBtn}
                            onClick={toggleMenu}
                            data-testid="menuBtn"
                        >
                            <Menu />
                        </IconButton>
                    </Hidden>
                )}
                <div className={styles.headerLogo}>
                    <HackathonTitle />
                </div>
                {showNavbar && (
                    <>
                        <Hidden implementation="css" smDown>
                            <Navbar cartQuantity={cartQuantity} />
                        </Hidden>
                        <Drawer
                            anchor="left"
                            open={mobileOpen}
                            onClose={toggleMenu}
                            className={styles.headerDrawer}
                        >
                            <div className={styles.headerDrawerTop}>
                                <IconButton
                                    color="inherit"
                                    aria-label="CloseMenu"
                                    className={styles.headerIconBtn}
                                    onClick={toggleMenu}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </div>
                            <div className={styles.headerDrawerHackathon}>
                                <HackathonTitle />
                                <Typography variant="body2">{userEmail}</Typography>
                            </div>
                            <Navbar cartQuantity={cartQuantity} />
                        </Drawer>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};
export default Header;
