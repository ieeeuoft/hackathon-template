import React from "react";
import styles from "./Navbar.module.scss";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
// Images and logos
import DashboardIcon from "@material-ui/icons/Dashboard";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import ListAlt from "@material-ui/icons/ListAlt";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import InsertChartOutlined from "@material-ui/icons/InsertChartOutlined";
import { ReactComponent as Inventory } from "assets/images/icons/Hardware.svg";
// Components
import Button from "@material-ui/core/Button";

import { logout } from "slices/users/userSlice";

export const UnconnectedNavbar = ({ logout, cartQuantity, pathname }) => (
    <nav className={styles.nav}>
        <div className={styles.navFlexDiv}>
            <Link to={"/"}>
                <Button
                    className={pathname === "/" ? styles.navActive : styles.navBtn}
                    aria-label="Dashboard"
                    startIcon={<DashboardIcon />}
                >
                    Dashboard
                </Button>
            </Link>
            <Link to={"/orders"}>
                <Button
                    className={
                        pathname === "/orders" ? styles.navActive : styles.navBtn
                    }
                    aria-label="Orders"
                    startIcon={<ListAlt />}
                >
                    Orders
                </Button>
            </Link>
            <Link to={"/teams"}>
                <Button
                    className={pathname === "/teams" ? styles.navActive : styles.navBtn}
                    aria-label="Teams"
                    startIcon={<AccountBoxIcon />}
                >
                    Teams
                </Button>
            </Link>
            <Link to={"/reports"}>
                <Button
                    className={
                        pathname === "/reports" ? styles.navActive : styles.navBtn
                    }
                    aria-label="Reports"
                    startIcon={<InsertChartOutlined />}
                >
                    Reports
                </Button>
            </Link>
            <Link to={"/inventory"}>
                <Button
                    className={
                        pathname === "/inventory" ? styles.navActive : styles.navBtn
                    }
                    aria-label="Inventory"
                    startIcon={<Inventory fill="currentColor" width="20px" />}
                >
                    Inventory
                </Button>
            </Link>
            <Link to={"/cart"}>
                <Button
                    className={pathname === "/cart" ? styles.navActive : styles.navBtn}
                    aria-label="Cart"
                    startIcon={<LocalMallIcon />}
                >
                    Cart ({cartQuantity})
                </Button>
            </Link>
        </div>
        <Button
            aria-label="Logout"
            className={`${styles.navBtn} ${styles.navBtnLogout}`}
            onClick={() => {
                logout();
            }}
        >
            <b>Logout</b>
        </Button>
    </nav>
);

const mapStateToProps = (state) => ({
    pathname: state.router.location.pathname,
});

const Navbar = connect(mapStateToProps, { logout })(UnconnectedNavbar);

export default Navbar;
