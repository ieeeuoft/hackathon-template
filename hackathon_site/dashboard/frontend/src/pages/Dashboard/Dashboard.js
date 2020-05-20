import React from "react";
import styles from "./Dashboard.module.scss";
import SponsorCard from "components/dashboard/SponsorCard/SponsorCard";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const Dashboard = () => {
    let sponsorsL = [
        { imgSrc: "AMD.svg" },
        { imgSrc: "CityofBrampton.svg" },
        { imgSrc: "CognitiveSystems.svg" },
        { imgSrc: "ECE.png" },
        { imgSrc: "ecobee.svg" },
        { imgSrc: "FacultyofAppliedScienceandEngineering.png" },
        { imgSrc: "Huawei.svg" },
    ];

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
                <SponsorCard sponsors={sponsorsL} />
            </Grid>
        </div>
    );
};

export default Dashboard;
