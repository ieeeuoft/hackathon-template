import React from "react";
import styles from "./CartSummary.module.scss";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

const CartSummary = ({ cartQuantity }) => (
    <div className={styles.card}>
        <Typography variant="h2">Cart Summary</Typography>
        <Paper elevation={3} className={styles.cardPaper} square={true}>
            <Container className={styles.cardPaperQty}>
                <Typography variant="body2">Quantity</Typography>
                <Typography variant="body2">{cartQuantity}</Typography>
            </Container>
            <Typography variant="body2" className={styles.cardPaperMsg}>
                Your entire team’s order is here. Before you submit, refresh the page if
                someone added something new.
            </Typography>
            <Button
                color="primary"
                variant="contained"
                fullWidth={true}
                onClick={() => {
                    alert("this would submit the order and redirect to dashboard");
                }}
            >
                Submit order
            </Button>
        </Paper>
    </div>
);

export default CartSummary;
