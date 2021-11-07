import React, { ChangeEvent, useState } from "react";
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

import { useSelector } from "react-redux";
import { RootState } from "slices/store";
import { hardwareSelectors } from "slices/hardware/hardwareSlice";

type SelectChangeEvent = ChangeEvent<{ value: string }>;

interface QuantitySelectorProps {
    quantity_remaining: number;
    handleChange: (e: SelectChangeEvent) => void;
    numInCart: number;
}

const QuantitySelector = ({
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
            <InputLabel shrink={true} id="Quantity">
                Quantity
            </InputLabel>
            <Select
                label="Quantity"
                value={numInCart}
                // A bit of typescript hacking, since Select's onChange event has
                // a value type of unknown and isn't a generic parameter.
                onChange={handleChange as SelectProps["onChange"]}
                name="quantity"
            >
                {[
                    ...Array(quantity_remaining).map((i) => (
                        <MenuItem key={i} role="quantity" value={i}>
                            {i}
                        </MenuItem>
                    )),
                ]}
            </Select>
        </FormControl>
    );
};

interface CartCardProps {
    hardware_id: number;
    quantity: number;
    error?: string;
}

export const CartCard = ({ hardware_id, quantity, error }: CartCardProps) => {
    const [numInCart, setNumInCart] = useState(quantity);

    // TODO: Are we guaranteed that the hardware will be in the state by this point?
    const hardware = useSelector((state: RootState) =>
        hardwareSelectors.selectById(state, hardware_id)
    );

    const handleChange = (event: ChangeEvent<{ name?: string; value: string }>) => {
        setNumInCart(parseInt(event.target.value));
    };

    const handleRemove = (id: number) => {
        alert(`Removing ${id}`);
    };

    return hardware ? (
        <Card className={styles.Cart} elevation={0}>
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
                    numInCart={numInCart}
                />
            </CardContent>
            <CardActions className={styles.CartAction}>
                <IconButton
                    size="small"
                    className={styles.CartClose}
                    onClick={() => {
                        handleRemove(hardware.id);
                    }}
                    role="remove"
                >
                    <CloseIcon />
                </IconButton>
            </CardActions>
        </Card>
    ) : null;
};

export default CartCard;
