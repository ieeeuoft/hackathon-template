import React, { ChangeEvent } from "react";
import styles from "./CartCard.module.scss";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Select, { SelectProps } from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "slices/store";
import { hardwareSelectors } from "slices/hardware/hardwareSlice";
import { removeFromCart, updateCart } from "slices/hardware/cartSlice";

const makeSelections = (quantity_remaining: number) => {
    const items = [];

    for (let i = 1; i < quantity_remaining + 1; i++) {
        items.push(
            <MenuItem key={i} role="quantity" value={i}>
                {i}
            </MenuItem>
        );
    }

    return items;
};

type SelectChangeEvent = ChangeEvent<{ value: string }>;

interface QuantitySelectorProps {
    quantity_remaining: number;
    handleChange: (e: SelectChangeEvent) => void;
    numInCart: number;
}
interface CartCardProps {
    hardware_id: number;
    quantity: number;
    error?: string;
}
export const QuantitySelector = ({
    quantity_remaining,
    numInCart,
    handleChange,
}: QuantitySelectorProps) => {
    if (!quantity_remaining) {
        return (
            <Typography variant="caption" className={styles.CartError}>
                Currently unavailable
            </Typography>
        );
    }

    return (
        <FormControl variant="outlined" size="small" className={styles.CartFormControl}>
            <InputLabel shrink={true} id="QuantityLabel">
                Quantity
            </InputLabel>
            <Select
                label="Quantity"
                labelId="QuantityLabel"
                value={numInCart}
                // A bit of typescript hacking, since Select's onChange event has
                // a value type of unknown and isn't a generic parameter.
                onChange={handleChange as SelectProps["onChange"]}
            >
                {makeSelections(quantity_remaining)}
            </Select>
        </FormControl>
    );
};

export const CartCard = ({ hardware_id, quantity, error }: CartCardProps) => {
    const hardware = useSelector((state: RootState) =>
        hardwareSelectors.selectById(state, hardware_id)
    );

    const dispatch = useDispatch();

    const handleChange = (event: ChangeEvent<{ name?: string; value: string }>) => {
        dispatch(
            updateCart({
                id: hardware_id,
                changes: { quantity: parseInt(event.target.value) },
            })
        );
    };

    const handleRemove = (id: number) => {
        dispatch(removeFromCart(id));
    };

    return hardware ? (
        <Card
            className={styles.Cart}
            elevation={0}
            data-testid={`cart-item-${hardware_id}`}
        >
            <CardMedia
                className={styles.CartPic}
                image={hardware.picture}
                alt={hardware.name}
                component="img"
            />
            <CardContent className={styles.CartParts}>
                <Typography variant="body2" className={styles.CartName}>
                    {hardware.name}
                </Typography>
                {error && (
                    <Typography variant="caption" className={styles.CartError}>
                        {error}
                    </Typography>
                )}
                <QuantitySelector
                    quantity_remaining={hardware.quantity_remaining}
                    handleChange={handleChange}
                    numInCart={quantity}
                />
            </CardContent>
            <CardActions className={styles.CartAction}>
                <IconButton
                    size="small"
                    className={styles.CartClose}
                    onClick={() => {
                        handleRemove(hardware_id);
                    }}
                    data-testid="remove-cart-item"
                >
                    <CloseIcon />
                </IconButton>
            </CardActions>
        </Card>
    ) : null;
};

export default CartCard;
