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
import { useHistory } from "react-router-dom";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const allOrders = useSelector(adminOrderSelectors.selectAll);
    const pendingFilter: OrderFilters = {
        status: ["Submitted", "Ready for Pickup"],
    };
    dispatch(setFilters(pendingFilter));
    dispatch(getOrdersWithFilters());
    const numOrdersOnPage = 6;
    const ordersLength =
        allOrders.length <= numOrdersOnPage ? allOrders.length : numOrdersOnPage;
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
