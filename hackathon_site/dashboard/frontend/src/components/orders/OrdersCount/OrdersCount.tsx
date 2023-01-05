import React from "react";
import { IconButton, Typography } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import styles from "pages/Orders/Orders.module.scss";
import { FormikValues } from "formik";
import { adminOrderTotalSelector } from "../../../slices/order/adminOrderSlice";
import { useSelector } from "react-redux";

const OrdersCount = ({ refreshOrders }: FormikValues) => {
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
