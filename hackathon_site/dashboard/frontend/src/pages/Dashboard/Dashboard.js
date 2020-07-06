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
import { hackathonName } from "constants.js";

import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";
import ProductOverview from "components/general/ProductOverview/ProductOverview";

const testD = {
    name: "Arduino",
    type: "red",
    total: 30,
    available: 29,
    img: "https://www.filterforge.com/more/help/images/size200.jpg",
    category: ["MCU", "FPGA"],
    manufacturer: "Canakit",
    model_num: "Model 3B+",
    datasheet: "link",
    notes: ["- For micropython ask for image", "- randomnerdtutorials.com"],
    constraints: ["- Max 1 of this item", "- Max 3 microcontroller labelled red"],
    quantity: 3,
};

const testF = (qty) => {
    alert(qty);
};

const Dashboard = () => {
    return (
        <>
            <Header />
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
                <CheckedOutTable items={itemsCheckedOut} />
                <ReturnedTable items={itemsReturned} />
                <SideSheetRight title="ProductOverview">
                    <ProductOverview detail={testD} addCartFunction={testF} />
                </SideSheetRight>
            </div>
        </>
    );
};

export default Dashboard;
