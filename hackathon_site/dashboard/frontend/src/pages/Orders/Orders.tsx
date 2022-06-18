import React from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import OrdersSearch from "components/Orders/OrdersSearch/OrdersSearch";
import { Divider, Grid, IconButton } from "@material-ui/core";
import styles from "./Orders.module.scss";
import FilterListIcon from "@material-ui/icons/FilterList";
import RefreshIcon from "@material-ui/icons/Refresh";

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
                                <IconButton
                                    color="primary"
                                    aria-label="Search"
                                    // onClick={handleSubmit}
                                    data-testid="search-button"
                                >
                                    <FilterListIcon color="primary" />
                                </IconButton>

                                <div className={styles.ordersBodyToolbarRefresh}>
                                    <Typography variant="body2">2 results</Typography>
                                    <IconButton
                                        color="primary"
                                        aria-label="Refresh"
                                        // onClick={refreshHardware}
                                        data-testid="refreshInventory"
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default Orders;
