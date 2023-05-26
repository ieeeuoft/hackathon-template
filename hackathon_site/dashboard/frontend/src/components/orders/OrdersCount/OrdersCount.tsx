import React from "react";
import { IconButton, Typography } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useDispatch, useSelector } from "react-redux";
import styles from "pages/Orders/Orders.module.scss";
import {
    adminOrderTotalSelector,
    getOrdersWithFilters,
} from "slices/order/adminOrderSlice";

const OrdersCount = () => {
    const dispatch = useDispatch();
    const refreshOrders = () => {
        dispatch(getOrdersWithFilters());
    };
    const orderQuantity = useSelector(adminOrderTotalSelector);
    return (
        <div className={styles.ordersBodyToolbarRefresh}>
            <Typography variant="body2">{orderQuantity} results</Typography>
            <IconButton
                color="primary"
                aria-label="Refresh"
                onClick={refreshOrders}
                data-testid="refreshOrders"
            >
                <RefreshIcon />
            </IconButton>
        </div>
    );
};

export default OrdersCount;
