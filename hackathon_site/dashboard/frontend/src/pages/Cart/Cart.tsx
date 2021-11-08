import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Cart.module.scss";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import LinearProgress from "@material-ui/core/LinearProgress";

import Header from "components/general/Header/Header";
import CartCard from "components/cart/CartCard/CartCard";
import CartSummary from "components/cart/CartSummary/CartSummary";
import { mockCartItems } from "testing/mockData";
import {
    clearFilters,
    getHardwareWithFilters,
    isLoadingSelector as isHardwareLoadingSelector,
    selectHardwareByIds,
    setFilters,
} from "slices/hardware/hardwareSlice";
import { RootState } from "slices/store";

const Cart = () => {
    const cartQuantity = mockCartItems.reduce(
        (accum, item) => accum + item.quantity,
        0
    );

    const dispatch = useDispatch();
    const hardware = useSelector((state: RootState) =>
        selectHardwareByIds(
            state,
            mockCartItems.map((item) => item.hardware_id)
        )
    );
    const isHardwareLoading = useSelector(isHardwareLoadingSelector);

    useEffect(() => {
        if (isHardwareLoading) return;

        // Fetch any hardware that may be missing
        const loadedHardware = new Set<number>();

        for (const h of hardware) {
            if (h !== undefined) loadedHardware.add(h.id);
        }

        const missingHardware = new Set<number>();

        for (const item of mockCartItems) {
            if (!loadedHardware.has(item.hardware_id)) {
                missingHardware.add(item.hardware_id);
            }
        }

        if (missingHardware.size > 0) {
            const hardware_ids = Array.from(missingHardware);
            dispatch(clearFilters());
            dispatch(setFilters({ hardware_ids }));
            dispatch(getHardwareWithFilters({ keepOld: true }));
        }
    }, [dispatch, hardware, isHardwareLoading]);

    return (
        <>
            <Header />
            <Typography variant="h1">Cart</Typography>
            <Grid direction="row" spacing={6} className={styles.cart} container>
                <Grid xs={12} sm={12} md={7} item>
                    {isHardwareLoading ? (
                        <LinearProgress
                            style={{ width: "100%", marginTop: "10%" }}
                            data-testid="cart-linear-progress"
                        />
                    ) : (
                        mockCartItems.map(({ hardware_id, quantity }, i) => {
                            return (
                                <div key={i}>
                                    <CartCard
                                        hardware_id={hardware_id}
                                        quantity={quantity}
                                    />
                                    <Divider className={styles.cartDivider} />
                                </div>
                            );
                        })
                    )}
                </Grid>
                <Grid xs={12} sm={12} md={5} item>
                    <CartSummary cartQuantity={cartQuantity} />
                </Grid>
            </Grid>
        </>
    );
};

export default Cart;
