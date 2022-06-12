import React from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
import styles from "./AdminDashboard.module.scss";
import { OrderCard } from "components/dashboard/OrderCard/OrderCard";
import { OverviewCard } from "components/dashboard/OverviewCard/OverviewCard";
import { InfoChart } from "components/dashboard/InfoChart/InfoChart";

const AdminDashboard = () => {
    return (
        <>
            <Header />
            <div className={styles.dashboard}>
                <Typography variant="h1">{hackathonName} Hardware Dashboard</Typography>
                <OverviewCard />
                <OrderCard />
                <InfoChart />
            </div>
        </>
    );
};

export default AdminDashboard;
