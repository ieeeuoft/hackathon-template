import React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import ImageList from "@material-ui/core/ImageList";
import ImageListItem from "@material-ui/core/ImageListItem";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./AdminDashboard.module.scss";
import Header from "components/general/Header/Header";
import OrderCard from "components/orders/OrderCard/OrderCard";
import { mockPendingOrders, overviewTitles } from "testing/mockData";
import { hackathonName } from "constants.js";

const AdminDashboard = () => {
    const useStyles = makeStyles({
        imageList: {
            flexWrap: "nowrap",
            transform: "translateZ(0)",
        },
    });
    const classes = useStyles();
    return (
        <>
            <Header />
            <Typography variant="h1">{hackathonName} Admin Dashboard</Typography>
            <Grid className={styles.dashboard}>
                <div className={styles.section}>
                    <Typography className={styles.title}>Overview</Typography>
                    <ImageList
                        className={classes.imageList}
                        gap={8}
                        cols={5}
                        rowHeight={63}
                    >
                        {overviewTitles.map((title) => (
                            <ImageListItem className={styles.overviewCard} key={title}>
                                <Paper className={styles.overviewCard}>
                                    <Card className={styles.overviewCard}>
                                        <Typography variant="body2">
                                            &nbsp;&nbsp;&nbsp;{title}
                                        </Typography>
                                    </Card>
                                </Paper>
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>
                <div className={styles.section}>
                    <Typography className={styles.title}>
                        Pending Orders &emsp; &emsp;{" "}
                        <Button color="primary" href="/orders">
                            VIEW MORE
                        </Button>
                    </Typography>
                    <ImageList
                        className={classes.imageList}
                        gap={8}
                        cols={5}
                        rowHeight={175}
                    >
                        {mockPendingOrders.map((pendingOrder) => (
                            <ImageListItem
                                className={styles.overviewCard}
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
                                    status={pendingOrder.status}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>
            </Grid>
        </>
    );
};

export default AdminDashboard;
