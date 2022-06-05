import React from "react";
import { useSelector } from "react-redux";
import { cartTotalSelector, errorSelector } from "slices/hardware/cartSlice";
import Grid from "@material-ui/core/Grid";
import AlertBox from "components/general/AlertBox/AlertBox";

const CartErrorBox = () => {
    const cartQuantity = useSelector(cartTotalSelector);
    const orderSubmissionError = useSelector(errorSelector);

    return (
        <Grid direction="row" container>
            <Grid xs={12} sm={12} md={2} item />
            <Grid xs={12} sm={12} md={8} item>
                {orderSubmissionError && cartQuantity > 0 && (
                    <AlertBox
                        error={orderSubmissionError}
                        type="info"
                        title="Unable to submit your order because:"
                    />
                )}
            </Grid>
        </Grid>
    );
};

export default CartErrorBox;
