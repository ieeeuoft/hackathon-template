import React from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
import Grid from "@material-ui/core/Grid";
import styles from "./AdminDashboard.module.scss";
import DashCard from "components/dashboard/DashCard/DashCard";
import { mockPendingOrders, overviewTitles } from "testing/mockData";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";
import OrderCard from "components/orders/OrderCard/OrderCard";

const orderTitles = ["Team", "Order Qty", "Time ordered", "ID"];
const AdminDashboard = () => {
    return (
        <>
            <Header />
            <Typography variant="h1">{hackathonName} Admin Dashboard</Typography>
            <Grid className={styles.dashboard}>
                <div className={styles.section}>
                    <Typography className={styles.title}>Overview</Typography>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="flex-start"
                        spacing={3}
                        className="overviewCardGrid"
                    >
                        {overviewTitles.map((title) => (
                            <Grid
                                item
                                xs={2}
                                className={styles.overViewCard}
                                key={title}
                            >
                                <Paper className={styles.overviewCard}>
                                    <Card className={styles.overviewCard}>{title}</Card>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.section}>
                    <Typography className={styles.title}>
                        Pending Orders &emsp; &emsp; <a href="/orders">VIEW MORE</a>
                    </Typography>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="flex-start"
                        spacing={3}
                        className="orderCardGrid"
                    >
                        {mockPendingOrders.map((pendingOrder) => (
                            <Grid
                                item
                                xs={2}
                                className={styles.orderCard}
                                style={{ width: "225px", height: "164px" }}
                                key={pendingOrder.team_code}
                            >
                                <OrderCard
                                    teamCode={pendingOrder.team_code}
                                    orderQuantity={pendingOrder.request.reduce(
                                        (sum, requestedItem) =>
                                            sum + requestedItem.requested_quantity,
                                        0
                                    )}
                                    time={pendingOrder.updated_at}
                                    id={pendingOrder.team_id}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </Grid>
        </>
    );
};

export default AdminDashboard;
