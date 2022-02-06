import React from "react";
import styles from "./CartSummary.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TitledPaper from "components/general/TitledPaper/TitledPaper";
import { useDispatch, useSelector } from "react-redux";
import { cartTotalSelector, submitOrder } from "slices/hardware/cartSlice";

const CartSummary = () => {
    const cartQuantity = useSelector(cartTotalSelector);
    const dispatch = useDispatch();
    const onSubmit = () => {
        if (cartQuantity > 0) {
            dispatch(submitOrder());
        }
    };
    return (
        <TitledPaper title="Cart Summary">
            <Container className={styles.qty}>
                <Typography variant="body2">Quantity</Typography>
                <Typography variant="body2" data-testid="cart-quantity-total">
                    {cartQuantity}
                </Typography>
            </Container>
            <Typography variant="body2" className={styles.msg}>
                Your entire team's order is here. Before you submit, refresh the page if
                someone added something new.
            </Typography>
            <Button
                color="primary"
                variant="contained"
                className={styles.btn}
                disabled={cartQuantity === 0}
                onClick={onSubmit}
                disableElevation
                data-testid="submit-order-button"
            >
                Submit order
            </Button>
        </TitledPaper>
    );
};

export default CartSummary;
