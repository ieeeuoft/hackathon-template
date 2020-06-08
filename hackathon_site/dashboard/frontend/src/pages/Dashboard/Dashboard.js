import React from "react";
import styles from "./Dashboard.module.scss";
import ConnectedSponsorCard from "components/dashboard/SponsorCard/SponsorCard";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DashCard from "components/dashboard/DashCard/DashCard";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";
import Header from "../../components/general/Header/Header";

export const cardItems = [
    {
        title: "Hello",
        content: [{ name: "Test", url: "https://www.facebook.com", icon: <GetApp /> }],
    },
    {
        title: "Hi",
        content: [
            { name: "Test2", url: "https://www.youtube.com", icon: <OpenInNew /> },
        ],
    },
];

const Dashboard = () => {
    return (
        <>
            <Header />
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
                    {cardItems.map(({ title, content }, i) => (
                        <DashCard title={title} content={content} key={i} />
                    ))}
                    <ConnectedSponsorCard />
                </Grid>
            </div>
        </>
    );
};

export default Dashboard;
