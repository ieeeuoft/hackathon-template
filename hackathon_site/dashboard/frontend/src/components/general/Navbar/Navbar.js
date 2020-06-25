import React from "react";
import styles from "./Navbar.module.scss";
import { Link } from "react-router-dom";
// Images and logos
import DashboardIcon from "@material-ui/icons/Dashboard";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import Notifications from "@material-ui/icons/Notifications";
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import ListAlt from "@material-ui/icons/ListAlt";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import InsertChartOutlined from "@material-ui/icons/InsertChartOutlined";
import { ReactComponent as Inventory } from "assets/images/icons/Hardware.svg";
// Components
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import { Paper } from "@material-ui/core";
import { notifications } from "testing/mockData"
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import CloseIcon from '@material-ui/icons/Close';

const NotificationCard = () => (

    <Paper elevation={3} className={styles.notificationCard} square={true}>
        <List>
            {notifications.map((item, i) => (
                <ListItem divider className={item.unread && styles.unread}>
                    <ListItemText
                        primary={item.message}
                        />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="deleteNotification">
                            <CloseIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    </Paper>
)

export const Navbar = ({ cartQuantity, unreadNotificationQuantity }) => {
    const [notificationOpen, setNotificationOpen] = React.useState(true);
    const toggleNotificationCard = () => {
        setNotificationOpen(!notificationOpen);
    };
    return (
        <nav className={styles.nav}>
            <Hidden implementation="css" smDown>
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
                <Button
                    className={styles.navBtn}
                    aria-label="Notifications"
                    startIcon={unreadNotificationQuantity > 0 ? <NotificationsActiveIcon /> : <Notifications />}
                    onClick={toggleNotificationCard}
                >
                    
                    Notifications ({unreadNotificationQuantity})
                </Button>
                <Button aria-label="Logout" className={styles.navBtn}>
                    <b>Logout</b>
                </Button>
            </Hidden>
            <Hidden implementation="css" mdUp>
                <Link to={"/cart"}>
                    <IconButton className={styles.navIconBtn} aria-label="Cart">
                        <div className={styles.quantityIcon}>{cartQuantity}</div>
                        <LocalMallIcon />
                    </IconButton>
                </Link>

                <IconButton className={styles.navIconBtn} aria-label="Notifications" onClick={toggleNotificationCard} >
                    { unreadNotificationQuantity > 0 ?
                        <>
                            <div className={styles.quantityDot}>
                                {unreadNotificationQuantity}
                            </div>
                            <NotificationsActiveIcon />
                        </>
                    : <Notifications />}
                </IconButton>
            </Hidden>
            {notificationOpen &&
                <NotificationCard />
            }
        </nav>
    );
};

export const NavbarDrawer = () => (
    <nav className={styles.navMobile}>
        <div>
            <Link to={"/"}>
                <Button
                    className={styles.navMobileBtn}
                    aria-label="Dashboard"
                    startIcon={<DashboardIcon />}
                >
                    Dashboard
                </Button>
            </Link>
            <Link to={"/orders"}>
                <Button
                    className={styles.navMobileBtn}
                    aria-label="Orders"
                    startIcon={<ListAlt />}
                >
                    Orders
                </Button>
            </Link>
            <Link to={"/teams"}>
                <Button
                    className={styles.navMobileBtn}
                    aria-label="Teams"
                    startIcon={<AccountBoxIcon />}
                >
                    Teams
                </Button>
            </Link>
            <Link to={"/reports"}>
                <Button
                    className={styles.navMobileBtn}
                    aria-label="Reports"
                    startIcon={<InsertChartOutlined />}
                >
                    Reports
                </Button>
            </Link>
            <Link to={"/inventory"}>
                <Button
                    className={styles.navMobileBtn}
                    aria-label="Inventory"
                    startIcon={<Inventory className={styles.customIcon} />}
                >
                    Inventory
                </Button>
            </Link>
        </div>
        <Button
            aria-label="Logout"
            className={`${styles.navMobileBtn} ${styles.navMobileBtnLogout}`}
        >
            <b>Logout</b>
        </Button>
    </nav>
);
