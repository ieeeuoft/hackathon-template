import React from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
import OrderCard from "components/orders/OrderCard/OrderCard";
import { useDispatch, useSelector } from "react-redux";
import styles from "./AdminDashboard.module.scss";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {
    adminOrderSelectors,
    getOrdersWithFilters,
    setFilters,
} from "slices/order/adminOrderSlice";
import { OrderFilters } from "api/types";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const orders = useSelector(adminOrderSelectors.selectAll);
    const pendingFilter: OrderFilters = {
        status: ["Submitted", "Ready for Pickup"],
    };
    dispatch(setFilters(pendingFilter));
    dispatch(getOrdersWithFilters());
    const numOrdersOnPage = 6;
    const ordersLength =
        orders.length <= numOrdersOnPage ? orders.length : numOrdersOnPage;
    return (
        <>
            <Header />
            <Typography variant="h1">{hackathonName} Admin Dashboard</Typography>
            <Grid className={styles.dashboard}>
                <div className={styles.section}>
                    <Typography className={styles.title}>Overview</Typography>
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
                        {orders.slice(0, ordersLength).map((pendingOrder, idx) => (
                            <Grid item lg={2} md={3} sm={4} xs={12} key={idx}>
                                {["Submitted", "Ready for Pickup"].includes(
                                    pendingOrder.status
                                ) && (
                                    <OrderCard
                                        teamCode={pendingOrder.team_code}
                                        orderQuantity={pendingOrder.items.length}
                                        time={pendingOrder.updated_at}
                                        id={pendingOrder.team_id}
                                        status={pendingOrder.status}
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
