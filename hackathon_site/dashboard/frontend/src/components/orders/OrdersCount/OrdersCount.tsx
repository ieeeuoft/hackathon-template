import React from "react";
import { IconButton, Typography } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useSelector } from "react-redux";
import { FormikValues } from "formik";
import styles from "pages/Orders/Orders.module.scss";
import { adminOrderTotalSelector } from "../../../slices/order/adminOrderSlice";

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
