import React from "react";
import styles from "./Navbar.module.scss";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "logo.svg";
import Home from "@material-ui/icons/Home";
import ShoppingCart from "@material-ui/icons/ShoppingCart";
import Notifications from "@material-ui/icons/Notifications";
import ListAlt from "@material-ui/icons/ListAlt";
import AccountCircle from "@material-ui/icons/AccountCircle";
import InsertChartOutlined from "@material-ui/icons/InsertChartOutlined";
import Menu from "@material-ui/icons/Menu";
import { ReactComponent as Inventory } from "assets/images/icons/Hardware.svg";
import IconButton from "@material-ui/core/IconButton";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

const Navbar = () => (
    <AppBar className={styles.nav}>
        <Toolbar className={styles.navToolbar}>
            <div className={styles.navLogo}>
                <Logo className={`${styles.navLogoImg} ${styles.navIconsDisappear}`} />
                <Typography variant="h6" className={styles.navIconsDisappear}>
                    Hackathon Name
                </Typography>

                <IconButton
                    color="inherit"
                    aria-label="Menu"
                    className={styles.navIconsReappear}
                >
                    <Menu />
                </IconButton>
            </div>

            <div className={styles.navIcons}>
                <Link to={"/"} className={styles.navIconsDisappear}>
                    <IconButton color="inherit" aria-label="Dashboard">
                        <Home /> Dashboard
                    </IconButton>
                </Link>

                <Link to={"/orders"} className={styles.navIconsDisappear}>
                    <IconButton color="inherit" aria-label="Orders">
                        <ListAlt /> Orders
                    </IconButton>
                </Link>

                <Link to={"/teams"} className={styles.navIconsDisappear}>
                    <IconButton color="inherit" aria-label="Teams">
                        <AccountCircle /> Teams
                    </IconButton>
                </Link>

                <Link to={"/reports"} className={styles.navIconsDisappear}>
                    <IconButton color="inherit" aria-label="Reports">
                        <InsertChartOutlined /> Reports
                    </IconButton>
                </Link>

                <Link to={"/inventory"} className={styles.navIconsDisappear}>
                    <IconButton color="inherit" aria-label="Inventory">
                        <Inventory /> Inventory
                    </IconButton>
                </Link>

                <Link to={"/cart"}>
                    <IconButton color="inherit" aria-label="Cart">
                        <ShoppingCart />
                        <span className={styles.navIconsDisappear}>Cart</span>
                    </IconButton>
                </Link>

                <IconButton color="inherit" aria-label="Notifications">
                    <Notifications />
                    <span className={styles.navIconsDisappear}>Notifications</span>
                </IconButton>

                <IconButton
                    color="inherit"
                    aria-label="Logout"
                    className={styles.navIconsDisappear}
                >
                    Logout
                </IconButton>
            </div>
        </Toolbar>
    </AppBar>
);

export default Navbar;
