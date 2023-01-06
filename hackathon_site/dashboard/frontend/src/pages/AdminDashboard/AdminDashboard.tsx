import React from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
import Grid from "@material-ui/core/Grid";
import ImageList from "@material-ui/core/ImageList";
import ImageListItem from "@material-ui/core/ImageListItem";
import styles from "./AdminDashboard.module.scss";
import { mockPendingOrders, overviewTitles } from "testing/mockData";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";
import OrderCard from "components/orders/OrderCard/OrderCard";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

const AdminDashboard = () => {
    const useStyles = makeStyles({
        imageList: {
            flexWrap: "nowrap",
            transform: "translateZ(0)",
        },
        image: {
            maxWidth: 200,
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
                        rowHeight={70}
                    >
                        {overviewTitles.map((title) => (
                            <ImageListItem className={styles.overviewCard}>
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
                        rowHeight={164}
                    >
                        {mockPendingOrders.map((pendingOrder) => (
                            <ImageListItem className={styles.overviewCard}>
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
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>
            </Grid>
        </>
    );
};

export default AdminDashboard;
