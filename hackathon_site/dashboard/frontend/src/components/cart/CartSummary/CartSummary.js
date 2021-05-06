import React from "react";
import styles from "./CartSummary.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TitledPaper from "components/general/TitledPaper/TitledPaper";

const CartSummary = ({ cartQuantity }) => (
    <TitledPaper title="Cart Summary">
        <Container className={styles.qty}>
            <Typography variant="body2">Quantity</Typography>
            <Typography variant="body2">{cartQuantity}</Typography>
        </Container>
        <Typography variant="body2" className={styles.msg}>
            Your entire team's order is here. Before you submit, refresh the page if
            someone added something new.
        </Typography>
        <Button
            color="primary"
            variant="contained"
            className={styles.btn}
            onClick={() => {
                alert("this would submit the order and redirect to dashboard");
            }}
            disableElevation
        >
            Submit order
        </Button>
    </TitledPaper>
);

export default CartSummary;
