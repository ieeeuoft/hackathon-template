import React from "react";
import { IconButton, Typography } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import styles from "pages/Orders/Orders.module.scss";
import { FormikValues } from "formik";

const OrdersCount = ({ refreshOrders }: FormikValues) => {
    return (
        <div className={styles.ordersBodyToolbarRefresh}>
            <Typography variant="body2">2 results</Typography>
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
