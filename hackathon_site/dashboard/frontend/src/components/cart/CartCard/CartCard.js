import React from "react";
import styles from "./CartCard.module.scss";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const Selections = (currentStock) => {
    const items = [];

    for (let i = 1; i < currentStock + 1; i++) {
        items.push(
            <MenuItem key={i} role="quantity" value={i}>
                {i}
            </MenuItem>
        );
    }
    return items;
};

const Stock = ({ currentStock, handleChange, numOfCartItem }) => {
    if (!currentStock) {
        return (
            <Typography variant="caption" className={styles.CartError}>
                Currently unavailable
            </Typography>
        );
    } else {
        return (
            <FormControl
                variant="outlined"
                size="small"
                className={styles.CartFormControl}
            >
                <InputLabel shrink={true} id="Qty">
                    Qty
                </InputLabel>
                <Select
                    label="Qty"
                    value={numOfCartItem}
                    onChange={handleChange}
                    name="quantity"
                >
                    {Selections(currentStock)}
                </Select>
            </FormControl>
        );
    }
};

export const CartCard = ({
    id,
    image,
    title,
    currentStock,
    handleRemove,
    checkedOutQuantity,
    error,
}) => {
    const [numOfCartItem, setNumItem] = React.useState(checkedOutQuantity);
    const handleChange = (event) => {
        setNumItem(event.target.value);
    };

    return (
        <Card className={styles.Cart} elevation={0} key={id}>
            <CardMedia
                className={styles.CartPic}
                image={image}
                alt={title}
                component="img"
            />
            <CardContent className={styles.CartParts} elevation={0}>
                <Typography variant="body2" className={styles.CartName}>
                    {title}
                </Typography>
                {error && (
                    <Typography variant="caption" className={styles.CartError}>
                        {error}
                    </Typography>
                )}
                <Stock
                    currentStock={currentStock}
                    handleChange={handleChange}
                    numOfCartItem={numOfCartItem}
                />
            </CardContent>
            <CardActions className={styles.CartAction}>
                <IconButton
                    size="small"
                    className={styles.CartClose}
                    onClick={() => {
                        handleRemove(id);
                    }}
                    role="remove"
                >
                    <CloseIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default CartCard;
