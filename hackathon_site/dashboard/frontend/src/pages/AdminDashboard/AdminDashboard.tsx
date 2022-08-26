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
const AdminDashboard = () => {
    return (
        <>
            <Header />
            <Typography variant="h1">{hackathonName} Admin Dashboard</Typography>
            <Grid className={styles.section}>
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
            </Grid>
        </>
    );
};

export default AdminDashboard;
