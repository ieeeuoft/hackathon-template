import React from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
import Grid from "@material-ui/core/Grid";
import styles from "./AdminDashboard.module.scss";
import DashCard from "components/dashboard/DashCard/DashCard";
import { cardItems } from "testing/mockData";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";

const Titles = [
    "123 items checked out",
    "200 participants",
    "14 teams",
    "123 orders",
    "7 broken/lost items",
    "test item",
];
const Orders = [
    [3, 4, "11:30AM", 1342],
    [7, 44, "11:34AM", 3024],
    [33, 21, "11:39AM", 412],
    [22, 14, "11:40AM", 2031],
    [13, 2, "11:49AM", 1938],
    [10, 5, "11:50AM", 1823],
];
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
                        {Titles.map((title) => (
                            <Grid item xs={2} className={styles.overViewCard}>
                                <Paper className={styles.overviewCard}>
                                    <Card className={styles.overviewCard}>{title}</Card>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.section}>
                    <Typography className={styles.title}>
                        Pending Orders &emsp; &emsp; <a>VIEW MORE</a>
                    </Typography>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="flex-start"
                        spacing={3}
                        className="orderCardGrid"
                    >
                        {Orders.map((order) => (
                            <Grid item xs={2} className={styles.orderCard}>
                                <Paper className={styles.orderCard}>
                                    <Card className={styles.orderCard}>
                                        <span
                                            style={{
                                                float: "left",
                                                textAlign: "left",
                                                margin: 16,
                                            }}
                                        >
                                            {orderTitles[0]}
                                            <br />
                                            <br />
                                            {orderTitles[1]}
                                            <br />
                                            <br />
                                            {orderTitles[2]}
                                            <br />
                                            <br />
                                            {orderTitles[3]}
                                            <br />
                                        </span>
                                        <span
                                            style={{
                                                float: "right",
                                                textAlign: "right",
                                                margin: 16,
                                            }}
                                        >
                                            {order[0]} <br />
                                            <br />
                                            {order[1]} <br />
                                            <br />
                                            {order[2]} <br />
                                            <br />
                                            {order[3]} <br />
                                        </span>
                                    </Card>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </Grid>
        </>
    );
};

export default AdminDashboard;
