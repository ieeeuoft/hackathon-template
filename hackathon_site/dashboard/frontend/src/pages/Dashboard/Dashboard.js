import React from "react";
import styles from "./Dashboard.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DashCard from "components/dashboard/DashCard/DashCard";
import TeamCard from "components/dashboard/TeamCard/TeamCard";
import {
    PendingTable,
    ReturnedTable,
    CheckedOutTable,
} from "components/dashboard/ItemTable/ItemTable";
import ProductOverview from "components/inventory/ProductOverview/ProductOverview";
import Header from "components/general/Header/Header";
import {
    cardItems,
    itemsCheckedOut,
    itemsPending,
    itemsReturned,
    orderStatus,
    members,
    teamCode,
    productInformation,
} from "testing/mockData";
import { hackathonName } from "constants.js";

const Dashboard = () => {
    const reportIncident = (id) => {
        alert("Reports incident for component of id " + id);
    };

    const addToCart = () => {
        alert("add to cart");
    };

    const [mobileOpen, setMobileOpen] = React.useState(true);

    const toggleMenu = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            <Header />
            <ProductOverview
                detail={productInformation}
                addToCart={addToCart}
                isVisible={mobileOpen}
                handleClose={toggleMenu}
            />
            <div className={styles.dashboard}>
                <Typography variant="h1">{hackathonName} Hardware Dashboard</Typography>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
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
                <PendingTable items={itemsPending} status={orderStatus} />
                <CheckedOutTable
                    items={itemsCheckedOut}
                    reportIncident={reportIncident}
                />
                <ReturnedTable items={itemsReturned} />

                <button onClick={toggleMenu}>Open product overview</button>
            </div>
        </>
    );
};

export default Dashboard;
