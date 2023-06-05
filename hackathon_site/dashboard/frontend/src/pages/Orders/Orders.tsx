import React, { useEffect } from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import { Divider, Drawer, Grid, Hidden } from "@material-ui/core";
import OrdersSearch from "components/orders/OrdersSearch/OrdersSearch";
import OrdersFilterButton from "components/orders/OrdersFilterButton/OrdersFilterButton";
import OrdersCount from "components/orders/OrdersCount/OrdersCount";
import OrdersFilter from "components/orders/OrdersFilter/OrderFilter";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import styles from "./Orders.module.scss";
import OrderCard from "components/orders/OrderCard/OrderCard";
import { useDispatch, useSelector } from "react-redux";
import {
    adminOrderSelectors,
    getOrdersWithFilters,
} from "slices/order/adminOrderSlice";
import { useHistory } from "react-router-dom";
import { clearFilters } from "slices/hardware/hardwareSlice";

const Orders = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const allOrders = useSelector(adminOrderSelectors.selectAll);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const toggleFilter = () => {
        setMobileOpen(!mobileOpen);
    };

    useEffect(() => {
        dispatch(clearFilters());
        dispatch(getOrdersWithFilters());
    }, [dispatch]);

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
                <Grid item xl={2} md={3}>
                    <Hidden implementation="css" smDown>
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
                                {allOrders.map((order, idx) => (
                                    <Grid
                                        item
                                        lg={3}
                                        md={4}
                                        sm={6}
                                        xs={12}
                                        key={idx}
                                        onClick={() =>
                                            history.push(`/teams/${order.team_code}`)
                                        }
                                    >
                                        {[
                                            "Submitted",
                                            "Ready for Pickup",
                                            "Picked Up",
                                            "Cancelled",
                                            "Returned",
                                        ].includes(order.status) && (
                                            <OrderCard
                                                teamCode={order.team_code}
                                                orderQuantity={order.items.length}
                                                time={order.created_at}
                                                id={order.id}
                                                status={order.status}
                                                data-testid={`order-item-${order.id}`}
                                            />
                                        )}
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
