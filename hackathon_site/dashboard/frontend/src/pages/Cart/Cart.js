import React from "react";
import styles from "./Cart.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";

import CartCard from "components/cart/CartCard/CartCard";
import CartSummary from "components/cart/CartSummary/CartSummary";
import { cartItems, cartQuantity } from "testing/mockData";

const handleRemove = (id) => {
    alert("Remove item with id " + id + " from the cart");
};

const Cart = () => {
    return (
        <>
            <Header />
            <Typography variant="h1">Cart</Typography>

            <Grid direction="row" spacing={6} className={styles.cart} container>
                <Grid xs={12} sm={12} md={7} item>
                    {cartItems.map((item, i) => (
                        <div key={i}>
                            <CartCard
                                id={item.id}
                                image={item.image}
                                title={item.title}
                                currentStock={item.currentStock}
                                handleRemove={handleRemove}
                                checkedOutQuantity={item.checkedOutQuantity}
                                isError={item.isError}
                            />
                            <Divider className={styles.cartDivider} />
                        </div>
                    ))}
                </Grid>
                <Grid xs={12} sm={12} md={5} item>
                    <CartSummary cartQuantity={cartQuantity} />
                </Grid>
            </Grid>
        </>
    );
};

export default Cart;
