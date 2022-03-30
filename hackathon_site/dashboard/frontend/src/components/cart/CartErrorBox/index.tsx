import React from "react";
import { useSelector } from "react-redux";
import { cartTotalSelector, errorSelector } from "slices/hardware/cartSlice";
import Grid from "@material-ui/core/Grid";
import { Alert, AlertTitle } from "@material-ui/lab";

const CartErrorBox = () => {
    const cartQuantity = useSelector(cartTotalSelector);
    const orderSubmissionError = useSelector(errorSelector);

    return (
        <Grid direction="row" container>
            <Grid xs={12} sm={12} md={2} item />
            <Grid xs={12} sm={12} md={8} item>
                {orderSubmissionError && cartQuantity > 0 && (
                    <Alert severity="error" style={{ margin: "15px 0px" }}>
                        {typeof orderSubmissionError === "object" ? (
                            <>
                                <AlertTitle>
                                    Unable to submit your order because:
                                </AlertTitle>
                                <ul style={{ marginLeft: "20px" }}>
                                    {orderSubmissionError?.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            orderSubmissionError
                        )}
                    </Alert>
                )}
            </Grid>
        </Grid>
    );
};

export default CartErrorBox;