import React from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
// import orderCard from "components/orders/OrderCard/OrderCard";
import styles from "./AdminDashboard.module.scss";
import { Button } from "@material-ui/core";
import { ImageList } from "@material-ui/core";
import { ImageListItem } from "@material-ui/core";

const AdminDashboard = () => {
    return (
        <>
            <Header />
            <Typography variant="h1">{hackathonName} Admin Dashboard</Typography>
            <div className={styles.section}>
                <Typography className={styles.title}>
                    Pending Orders
                    <Button
                        color="primary"
                        href="/orders"
                        className={styles.titleButton}
                    >
                        View More
                    </Button>
                </Typography>
                <ImageList gap={8} cols={6} rowHeight={164}>
                    {itemData.map((item) => (
                        <ImageListItem key={item.img}>
                            <img
                                src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                                srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                alt={item.title}
                                loading="lazy"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </div>
        </>
    );
};

export default AdminDashboard;
