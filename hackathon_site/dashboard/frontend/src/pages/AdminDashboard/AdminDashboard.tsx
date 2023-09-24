import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import OrderCard from "components/orders/OrderCard/OrderCard";
import styles from "./AdminDashboard.module.scss";
import { hackathonName } from "constants.js";
import { OrderFilters } from "api/types";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { styled } from "@material-ui/core/styles";
import MemoryIcon from "@material-ui/icons/Memory";
import PeopleIcon from "@material-ui/icons/People";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import BrokenImageIcon from "@material-ui/icons/BrokenImage";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
    teamCountSelector,
    getTeamsWithSearchThunk,
    totalParticipantCountSelector,
} from "slices/event/teamAdminSlice";
import { clearFilters } from "slices/hardware/hardwareSlice";
import {
    adminOrderSelectors,
    getOrdersWithFilters,
    setFilters,
    adminOrderTotalSelector,
    adminCheckedOutOrderTotalSelector,
} from "slices/order/adminOrderSlice";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const allOrders = useSelector(adminOrderSelectors.selectAll);
    const orderQuantity = useSelector(adminOrderTotalSelector);
    const count = useSelector(teamCountSelector);
    const participants = useSelector(totalParticipantCountSelector);
    const checkedOut = useSelector(adminCheckedOutOrderTotalSelector);
    const numOrdersOnPage = 6;
    const ordersLength =
        allOrders.length <= numOrdersOnPage ? allOrders.length : numOrdersOnPage;
    // TODO: Create selector for Broken/Lost Item

    useEffect(() => {
        const pendingFilter: OrderFilters = {
            status: ["Submitted", "Ready for Pickup"],
        };
        dispatch(setFilters(pendingFilter));
        dispatch(clearFilters());
        dispatch(getOrdersWithFilters());
        dispatch(getTeamsWithSearchThunk());
    }, [dispatch]);
    return (
        <>
            <Header />
            <Typography variant="h1">{hackathonName} Admin Dashboard</Typography>
            <Grid className={styles.dashboard}>
                <div className={styles.dashboard}>
                    <Typography className={styles.overviewTitle} variant="h2">
                        {" "}
                        Overview{" "}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid wrap="nowrap" container spacing={2}>
                            <Grid item xs={5} md={3}>
                                <Item>
                                    <Box display="flex" alignItems="center">
                                        <MemoryIcon />{" "}
                                        <Typography
                                            variant="inherit"
                                            className={styles.itemContent}
                                        >
                                            {checkedOut} item's checked out
                                        </Typography>
                                    </Box>
                                </Item>
                            </Grid>
                            <Grid item xs={5} md={3}>
                                <Item>
                                    <Box display="flex" alignItems="center">
                                        <PeopleIcon />{" "}
                                        <Typography
                                            variant="inherit"
                                            className={styles.itemContent}
                                        >
                                            {participants} participants
                                        </Typography>
                                    </Box>
                                </Item>
                            </Grid>
                            <Grid item xs={5} md={3}>
                                <Item>
                                    <Box display="flex" alignItems="center">
                                        <AccountBoxIcon />{" "}
                                        <Typography
                                            variant="inherit"
                                            className={styles.itemContent}
                                        >
                                            {count} teams
                                        </Typography>
                                    </Box>
                                </Item>
                            </Grid>
                            <Grid item xs={5} md={3}>
                                <Item>
                                    <Box display="flex" alignItems="center">
                                        <LocalMallIcon />{" "}
                                        <Typography
                                            variant="inherit"
                                            className={styles.itemContent}
                                        >
                                            {orderQuantity} orders
                                        </Typography>
                                    </Box>
                                </Item>
                            </Grid>
                            <Grid item xs={5} md={3}>
                                <Item>
                                    <Box display="flex" alignItems="center">
                                        <BrokenImageIcon />{" "}
                                        <Typography
                                            variant="inherit"
                                            className={styles.itemContent}
                                        >
                                            7 broken/lost items
                                        </Typography>
                                    </Box>
                                </Item>
                            </Grid>
                        </Grid>
                    </Box>
                </div>

                <div className={styles.section}>
                    <Typography className={styles.title}>
                        Pending Orders
                        <Button
                            color="primary"
                            href="/orders"
                            className={styles.titleButton}
                        >
                            VIEW ALL
                        </Button>
                    </Typography>
                    <Grid
                        container
                        spacing={2}
                        direction="row"
                        justifyContent="flex-start"
                    >
                        {allOrders.slice(0, ordersLength).map((order, idx) => (
                            <Grid
                                item
                                lg={2}
                                md={3}
                                sm={4}
                                xs={12}
                                key={idx}
                                onClick={() =>
                                    history.push(`/teams/${order.team_code}`)
                                }
                            >
                                {["Submitted", "Ready for Pickup"].includes(
                                    order.status
                                ) && (
                                    <OrderCard
                                        teamCode={order.team_code}
                                        orderQuantity={order.items.length}
                                        time={order.updated_at}
                                        id={order.id}
                                        status={order.status}
                                        data-testid={`order-item-${order.id}`}
                                    />
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </Grid>
        </>
    );
};

export default AdminDashboard;
