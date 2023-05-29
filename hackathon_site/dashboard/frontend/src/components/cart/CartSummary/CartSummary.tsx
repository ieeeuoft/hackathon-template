import React from "react";
import styles from "./CartSummary.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TitledPaper from "components/general/TitledPaper/TitledPaper";
import { useDispatch, useSelector } from "react-redux";
import {
    cartTotalSelector,
    isLoadingSelector,
    submitOrder,
} from "slices/hardware/cartSlice";
import CircularProgress from "@material-ui/core/CircularProgress";
import { teamSizeSelector } from "slices/event/teamSlice";
import { isTestUserSelector } from "slices/users/userSlice";
import {
    hardwareSignOutEndDate,
    hardwareSignOutStartDate,
    maxTeamSize,
    minTeamSize,
} from "constants.js";

const CartSummary = () => {
    const isTestUser = useSelector(isTestUserSelector);
    const cartQuantity = useSelector(cartTotalSelector);
    const cartOrderLoading = useSelector(isLoadingSelector);
    const teamSize = useSelector(teamSizeSelector);
    const teamSizeValid = teamSize >= minTeamSize && teamSize <= maxTeamSize;
    const dispatch = useDispatch();
    const onSubmit = () => {
        if (cartQuantity > 0) {
            dispatch(submitOrder());
        }
    };
    const currentDateTime = new Date();
    const isOutsideSignOutPeriod =
        currentDateTime < hardwareSignOutStartDate ||
        currentDateTime > hardwareSignOutEndDate;

    return (
        <TitledPaper title="Cart Summary">
            <Container className={styles.qty}>
                <Typography variant="body2">Quantity</Typography>
                <Typography variant="body2" data-testid="cart-quantity-total">
                    {cartQuantity}
                </Typography>
            </Container>
            <Typography variant="body2" className={styles.msg}>
                Your entire team's order is here. Ensure that you have the correct
                number of hardware items before submitting.
            </Typography>
            <Button
                color="primary"
                variant="contained"
                className={styles.btn}
                disabled={
                    cartQuantity === 0 ||
                    cartOrderLoading ||
                    !teamSizeValid ||
                    (!isTestUser && isOutsideSignOutPeriod)
                }
                onClick={onSubmit}
                disableElevation
                data-testid="submit-order-button"
            >
                {cartOrderLoading ? (
                    <CircularProgress size={20} data-testid="order-loading-icon" />
                ) : (
                    "Submit order"
                )}
            </Button>
        </TitledPaper>
    );
};

export default CartSummary;
