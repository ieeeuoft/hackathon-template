import React from "react";
import styles from "./Dashboard.module.scss";
import ConnectedSponsorCard from "components/dashboard/SponsorCard/SponsorCard";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DashCard from "components/dashboard/DashCard/DashCard";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";
import ItemTable from "components/dashboard/ItemTable/ItemTable";

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

// order pending: name, url, requested qty, granted qty
// checked out: url, name, info, qty
// returned: url, name, time, condition

export const itemsC = [
    { url: "https://i.imgur.com/bxd6PNO.jpeg", name: "Arduino", qty: 6 },
    { url: "https://i.imgur.com/bxd6PNO.jpeg", name: "Raspi", qty: 9 },
    {
        url: "https://i.imgur.com/bxd6PNO.jpeg",
        name: "Grove temperature and humidity sensor pro",
        qty: 16,
    },
    { url: "https://i.imgur.com/bxd6PNO.jpeg", name: "Blah", qty: 7 },
];

export const itemsR = [
    {
        url: "https://i.imgur.com/bxd6PNO.jpeg",
        name: "Arduino",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
    {
        url: "https://i.imgur.com/bxd6PNO.jpeg",
        name: "Raspi",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
    {
        url: "https://i.imgur.com/bxd6PNO.jpeg",
        name: "Grove temperature and humidity sensor pro",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
];

export const itemsP = [
    {
        url: "https://i.imgur.com/bxd6PNO.jpeg",
        name: "Arduino",
        reqQty: 1,
        grantQty: null,
    },
];

// Order status can be null, "ready", "pending", or "error"
const orderStatus = "ready";

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
                {cardItems.map(({ title, content }, i) => (
                    <DashCard title={title} content={content} key={i} />
                ))}
                <ConnectedSponsorCard />
            </Grid>
            {orderStatus !== null && (
                <ItemTable title="Order pending" items={itemsP} status={orderStatus} />
            )}
            <ItemTable title="Checked out items" items={itemsC} status={orderStatus} />
            <ItemTable title="Returned items" items={itemsR} status={orderStatus} />
        </div>
    );
};

export default Dashboard;
