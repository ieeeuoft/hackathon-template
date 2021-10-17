import React from "react";
import styles from "./Cart.module.scss";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";

import Header from "components/general/Header/Header";
import CartCard from "components/cart/CartCard/CartCard";
import CartSummary from "components/cart/CartSummary/CartSummary";
import { cartItems } from "testing/mockData";

const Cart = () => {
    const cartQuantity = cartItems.reduce((accum, item) => accum + item.quantity, 0);
    return (
        <>
            <Header />
            <Typography variant="h1">Cart</Typography>

            <Grid direction="row" spacing={6} className={styles.cart} container>
                <Grid xs={12} sm={12} md={7} item>
                    {cartItems.map(({ hardware_id, quantity }, i) => {
                        return (
                            <div key={i}>
                                <CartCard
                                    hardware_id={hardware_id}
                                    quantity={quantity}
                                />
                                <Divider className={styles.cartDivider} />
                            </div>
                        );
                    })}
                </Grid>
                <Grid xs={12} sm={12} md={5} item>
                    <CartSummary cartQuantity={cartQuantity} />
                </Grid>
            </Grid>
        </>
    );
};

export default Cart;
