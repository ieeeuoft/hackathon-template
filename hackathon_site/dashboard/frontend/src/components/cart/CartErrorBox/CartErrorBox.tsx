import React from "react";
import { useSelector } from "react-redux";
import { cartTotalSelector, errorSelector } from "slices/hardware/cartSlice";
import Grid from "@material-ui/core/Grid";
import { teamSizeSelector } from "slices/event/teamSlice";
import { maxTeamSize, minTeamSize } from "constants.js";
import AlertBox from "components/general/AlertBox/AlertBox";
import { Link } from "@material-ui/core";
import DateRestrictionAlert from "components/general/DateRestrictionAlert/DateRestrictionAlert";

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
                <DateRestrictionAlert />
                {orderSubmissionError && cartQuantity > 0 && (
                    <AlertBox
                        error={orderSubmissionError}
                        type="error"
                        title="Unable to submit your order because:"
                    />
                )}
                {(teamSizeTooLarge || teamSizeTooSmall) && (
                    <AlertBox
                        body={
                            <>
                                {`There are too ${errorMessage} people on your team to place an
                            order. We only allow teams between ${minTeamSize} to ${maxTeamSize} 
                            people to checkout items. To join or leave a team please
                            go to your `}
                                <Link href="/" underline="always">
                                    {"Dashboard"}
                                </Link>
                                {` and click the EDIT
                            button under your team.`}
                            </>
                        }
                        type="warning"
                        title={`Team Size Too ${errorTitle}!`}
                    />
                )}
            </Grid>
        </Grid>
    );
};

export default CartErrorBox;
