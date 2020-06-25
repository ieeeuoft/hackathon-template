import React from "react";
import styles from "./Navbar.module.scss";
import { Link } from "react-router-dom";
// Images and logos
import DashboardIcon from "@material-ui/icons/Dashboard";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import ListAlt from "@material-ui/icons/ListAlt";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import InsertChartOutlined from "@material-ui/icons/InsertChartOutlined";
import { ReactComponent as Inventory } from "assets/images/icons/Hardware.svg";
// Components
import Button from "@material-ui/core/Button";

const Navbar = ({ cartQuantity }) => {
    return (
        <nav className={styles.nav}>
            <div className={styles.navFlexDiv}>
                <Link to={"/"}>
                    <Button
                        className={styles.navBtn}
                        aria-label="Dashboard"
                        startIcon={<DashboardIcon />}
                    >
                        Dashboard
                    </Button>
                </Link>
                <Link to={"/orders"}>
                    <Button
                        className={styles.navBtn}
                        aria-label="Orders"
                        startIcon={<ListAlt />}
                    >
                        Orders
                    </Button>
                </Link>
                <Link to={"/teams"}>
                    <Button
                        className={styles.navBtn}
                        aria-label="Teams"
                        startIcon={<AccountBoxIcon />}
                    >
                        Teams
                    </Button>
                </Link>
                <Link to={"/reports"}>
                    <Button
                        className={styles.navBtn}
                        aria-label="Reports"
                        startIcon={<InsertChartOutlined />}
                    >
                        Reports
                    </Button>
                </Link>

                <Link to={"/inventory"}>
                    <Button
                        className={styles.navBtn}
                        aria-label="Inventory"
                        startIcon={<Inventory className={styles.customIcon} />}
                    >
                        Inventory
                    </Button>
                </Link>
                <Link to={"/cart"}>
                    <Button
                        className={styles.navBtn}
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
            >
                <b>Logout</b>
            </Button>
        </nav>
    );
};
export default Navbar;
