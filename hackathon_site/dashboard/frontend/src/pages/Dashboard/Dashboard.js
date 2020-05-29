import React from "react";
import styles from "./Dashboard.module.scss";
import ConnectedSponsorCard from "components/dashboard/SponsorCard/SponsorCard";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DashCard from "components/dashboard/DashCard/DashCard";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";

let testTitle = "Hello";
let testContent = [
    { name: "Test", url: "www.facebook.com", icon: <GetApp /> },
    { name: "Test", url: "www.facebook.com", icon: <OpenInNew /> },
];

const Dashboard = () => {
    return (
        <div className={styles.dashboard}>
            <Typography variant="h1">Hackathon Name Hardware Dashboard</Typography>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={2}
                className={styles.dashboardGrid}
            >
                <DashCard title={testTitle} content={testContent} />
                <DashCard title={testTitle} content={testContent} />
                <ConnectedSponsorCard />
            </Grid>
        </div>
    );
};

export default Dashboard;
