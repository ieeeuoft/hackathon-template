import React from "react";
import Container from "@material-ui/core/Container";
import styles from "./InfoChart.module.scss";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { mockAdminPendingOrders } from "../../../testing/mockData";

// <Paper elevation={2} square={true} className={styles.paper}>
//                 {children}
//             </Paper>

export const InfoChart = () => {
    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            <div className={styles.title}>
                <Grid
                    item
                    md={3}
                    sm={4}
                    xs={6}
                    className={styles.dashboardGridItem}
                    key={1}
                >
                    <Typography
                        variant="h2"
                        className={styles.title}
                        data-testid="titledPaperTitle"
                        noWrap
                    >
                        Orders over time report
                    </Typography>
                    <Paper elevation={2} square={true} className={styles.paper}></Paper>
                </Grid>
                <Grid
                    item
                    md={3}
                    sm={4}
                    xs={6}
                    className={styles.dashboardGridItem}
                    key={2}
                >
                    <Typography
                        variant="h2"
                        className={styles.title}
                        data-testid="titledPaperTitle"
                        noWrap
                    >
                        Components checked out over time report
                    </Typography>
                    <Paper elevation={2} square={true} className={styles.paper}></Paper>
                </Grid>
            </div>
        </Container>
    );
};
