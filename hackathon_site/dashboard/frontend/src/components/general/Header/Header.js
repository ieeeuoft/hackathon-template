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
import SideSheetLeft from "components/general/SideSheetLeft/SideSheetLeft";
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
                        <SideSheetLeft title="Menu" toggleState={mobileOpen} toggleFunc={toggleMenu}>
                            <div className={styles.headerDrawerHackathon}>
                                <HackathonTitle />
                                <Typography variant="body2">{userEmail}</Typography>
                            </div>
                            <Navbar cartQuantity={cartQuantity} />
                        </SideSheetLeft>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};
export default Header;
