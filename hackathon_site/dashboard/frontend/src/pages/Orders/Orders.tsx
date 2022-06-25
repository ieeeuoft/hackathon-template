import React from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import { Divider, Drawer, Grid, Hidden } from "@material-ui/core";
import OrdersSearch from "components/orders/OrdersSearch/OrdersSearch";
import OrdersFilterButton from "components/orders/OrdersFilterButton/OrdersFilterButton";
import OrdersCount from "components/orders/OrdersCount/OrdersCount";
import OrdersFilter from "components/orders/OrdersFilter/OrderFilter";
import styles from "./Orders.module.scss";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

const Orders = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const toggleFilter = () => {
        setMobileOpen(!mobileOpen);
    };
    return (
        <>
            <Header />

            <Drawer
                className={styles.orderFilterDrawer}
                open={mobileOpen}
                onClose={toggleFilter}
            >
                <div className={styles.ordersFilterDrawerTop}>
                    <Typography variant="h2">Filters</Typography>
                    <IconButton
                        color="inherit"
                        aria-label="CloseFilter"
                        onClick={toggleFilter}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <OrdersFilter />
            </Drawer>
            <Grid container spacing={5} direction="row" className={styles.orders}>
                <Grid item xl={2} lg={3} md={3}>
                    <Hidden implementation="css" smDown>
                        {/* <div
                            style={{
                                backgroundColor: "lightblue",
                                padding: "10px",
                                borderRadius: "5px",
                                border: "1px solid black",
                            }}
                        >
                            Filters Component (remove this div once its starting to be
                            worked on)
                        </div> */}
                        <OrdersFilter />
                    </Hidden>
                </Grid>
                <Grid item xl={10} lg={9} md={9} sm={12}>
                    <Grid container spacing={2} direction="column">
                        <Grid item lg={12} className={styles.ordersBody}>
                            <Typography variant="h1" className={styles.ordersBodyTitle}>
                                Orders
                            </Typography>
                            <div className={styles.ordersBodyToolbar}>
                                <OrdersSearch />

                                <Divider
                                    orientation="vertical"
                                    className={styles.ordersBodyToolbarDivider}
                                    data-testid="ordersCountDivider"
                                    flexItem
                                />

                                <div className={styles.ordersBodyToolbarDiv}>
                                    <Hidden implementation="css" mdUp>
                                        <OrdersFilterButton
                                            handleSubmit={toggleFilter}
                                        />
                                    </Hidden>
                                    <OrdersCount />
                                </div>
                            </div>
                        </Grid>
                        <Grid item lg={12}>
                            <Grid container spacing={1} direction="row">
                                {Array(12)
                                    .fill("order card component")
                                    .map((str, idx) => (
                                        <Grid
                                            item
                                            lg={3}
                                            md={4}
                                            sm={6}
                                            xs={12}
                                            key={idx}
                                        >
                                            <div
                                                style={{
                                                    border: "1px solid black",
                                                    borderRadius: "5px",
                                                    padding: "10px",
                                                    textAlign: "center",
                                                    backgroundColor: "lightblue",
                                                }}
                                            >
                                                {str}
                                            </div>
                                        </Grid>
                                    ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};

export default Orders;
