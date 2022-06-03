import React from "react";
import { useSelector } from "react-redux";
import { cartTotalSelector, errorSelector } from "slices/hardware/cartSlice";
import Grid from "@material-ui/core/Grid";
import { Alert, AlertTitle } from "@material-ui/lab";
import { teamSizeSelector } from "slices/event/teamSlice";
import { maxTeamSize, minTeamSize } from "constants.js";
import AlertBox from "components/general/AlertBox/AlertBox";

const CartErrorBox = () => {
    const cartQuantity = useSelector(cartTotalSelector);
    const orderSubmissionError = useSelector(errorSelector);
    const teamSize = useSelector(teamSizeSelector);
    const teamSizeTooLarge = teamSize > maxTeamSize;
    const teamSizeTooSmall = teamSize < minTeamSize;
    const errorMessage = teamSizeTooLarge ? "many" : teamSizeTooSmall ? "few" : "";
    const errorTitle = teamSizeTooLarge ? "Large" : teamSizeTooSmall ? "Small" : "";

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
                {(teamSizeTooLarge || teamSizeTooSmall) && (
                    <Alert severity="warning" style={{ margin: "15px 0px" }}>
                        <AlertTitle>{`Team Size Too ${errorTitle}!`}</AlertTitle>
                        {`There are too ${errorMessage} people on your team to place an
                        order. We only allow teams between ${minTeamSize} to ${maxTeamSize} 
                        to checkout items. To join or leave a team please
                        go to your `}
                        <a href="/">Dashboard </a>
                        {` and click the EDIT
                        button under your team.`}
                    </Alert>
                )}
            </Grid>
        </Grid>
    );
};

export default CartErrorBox;
