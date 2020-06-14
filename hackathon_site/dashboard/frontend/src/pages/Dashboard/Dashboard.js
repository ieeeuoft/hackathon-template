import React from "react";
import styles from "./Dashboard.module.scss";
import ConnectedSponsorCard from "components/dashboard/SponsorCard/SponsorCard";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DashCard from "components/dashboard/DashCard/DashCard";
import TeamCard from "components/dashboard/TeamCard/TeamCard";
import {
    PendingTable,
    ReturnedTable,
    CheckedOutTable,
} from "components/dashboard/ItemTable/ItemTable";
import Header from "components/general/Header/Header";
import {
    cardItems,
    itemsCheckedOut,
    itemsPending,
    itemsReturned,
    orderStatus,
    members,
    teamCode,
} from "testing/mockData";

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
                    <TeamCard members={members} teamCode={teamCode} />
                    {cardItems.map(({ title, content }, i) => (
                        <DashCard title={title} content={content} key={i} />
                    ))}
                    <ConnectedSponsorCard />
                </Grid>
                <PendingTable items={itemsPending} status={orderStatus} />
                <CheckedOutTable items={itemsCheckedOut} />
                <ReturnedTable items={itemsReturned} />
            </div>
        </>
    );
};

export default Dashboard;
