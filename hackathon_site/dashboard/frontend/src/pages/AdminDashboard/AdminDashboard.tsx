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
import OrderCard from "components/orders/OrderCard/OrderCard";

const Titles = [
    "123 items checked out",
    "200 participants",
    "14 teams",
    "123 orders",
    "7 broken/lost items",
    "test item",
];
const Orders = [
    ["3", 4, "01/01/2022", 1342],
    ["7", 44, "02/02/2023", 3024],
    ["33", 21, "03/03/2024", 412],
    ["22", 14, "04/04/2023", 2031],
    ["13", 2, "05/05/2021", 1938],
    ["10", 5, "03/03/2020", 1823],
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
                            <Grid
                                item
                                xs={2}
                                className={styles.orderCard}
                                style={{ width: "225px", height: "164px" }}
                            >
                                <OrderCard
                                    teamCode={order[0].toString()}
                                    orderQuantity={Number(order[1])}
                                    time={order[2].toString()}
                                    id={Number(order[3])}
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
