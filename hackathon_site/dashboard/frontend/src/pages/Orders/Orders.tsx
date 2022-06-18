import React from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import { Divider, Grid } from "@material-ui/core";
import OrdersSearch from "components/Orders/OrdersSearch/OrdersSearch";
import OrdersFilter from "components/Orders/OrdersFilter/OrdersFilter";
import OrdersCount from "components/Orders/OrdersCount/OrdersCount";
import styles from "./Orders.module.scss";

const Orders = () => {
    return (
        <>
            <Header />
            <div className={styles.orders}>
                <Grid container spacing={2} className={styles.ordersBody}>
                    <Grid item md={8} xl={10} xs={10} className={styles.ordersBody}>
                        <Typography variant="h1" className={styles.ordersBodyTitle}>
                            Orders
                        </Typography>
                        <div className={styles.ordersBodyToolbar}>
                            <div>
                                <OrdersSearch />
                            </div>

                            <Divider
                                orientation="vertical"
                                className={styles.ordersBodyToolbarDivider}
                                flexItem
                            />

                            <div className={styles.ordersBodyToolbarDiv}>
                                <OrdersFilter />
                                <OrdersCount />
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default Orders;
