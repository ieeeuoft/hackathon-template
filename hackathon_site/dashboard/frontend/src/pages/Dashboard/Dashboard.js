import React from "react";
import styles from "./Dashboard.module.scss";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DashCard from "components/dashboard/DashCard/DashCard";
import TeamCard from "components/dashboard/TeamCard/TeamCard";
import {
    PendingTable,
    ReturnedTable,
    CheckedOutTable,
    BrokenTable,
} from "components/dashboard/ItemTable/ItemTable";
import ProductOverview from "components/inventory/ProductOverview/ProductOverview";
import Header from "components/general/Header/Header";
import {
    cardItems,
    itemsCheckedOut,
    itemsPending,
    itemsReturned,
    itemsBroken,
    orderStatus,
    members,
    teamCode,
} from "testing/mockData";
import { hackathonName } from "constants.js";

const Dashboard = () => {
    const reportIncident = (id) => {
        alert("Reports incident for component of id " + id);
    };

    const [sideSheetOpen, setSideSheetOpen] = React.useState(false);

    const toggleMenu = () => {
        setSideSheetOpen(!sideSheetOpen);
    };

    const openBrokenTable = (id) => {
        alert("This would open the report for item of id " + id);
    };
    return (
        <>
            <Header />
            {/* TODO: show product overview when order hardware item is clicked */}
            <ProductOverview showAddToCartButton={false} />
            <div className={styles.dashboard}>
                <Typography variant="h1">{hackathonName} Hardware Dashboard</Typography>
                <Grid
                    container
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    spacing={2}
                    className={styles.dashboardGrid}
                >
                    <Grid
                        item
                        md={3}
                        sm={4}
                        xs={6}
                        className={styles.dashboardGridItem}
                        key={0}
                    >
                        <TeamCard members={members} teamCode={teamCode} />
                    </Grid>
                    {cardItems.map(({ title, content }, i) => (
                        <Grid
                            item
                            md={3}
                            sm={4}
                            xs={6}
                            className={styles.dashboardGridItem}
                            key={i + 1}
                        >
                            <DashCard title={title} content={content} />
                        </Grid>
                    ))}
                </Grid>
                <BrokenTable items={itemsBroken} openReportAlert={openBrokenTable} />
                <PendingTable items={itemsPending} status={orderStatus} />
                <CheckedOutTable
                    items={itemsCheckedOut}
                    reportIncident={reportIncident}
                />
                <ReturnedTable items={itemsReturned} />

                <Button variant="contained" onClick={toggleMenu} disableElevation>
                    Open product overview
                </Button>
            </div>
        </>
    );
};

export default Dashboard;
