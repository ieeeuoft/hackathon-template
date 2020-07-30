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
    let i = 0;

    for (i = 1; i < currentStock + 1; i++) {
        items.push(
            <MenuItem key={i} role="quantity" value={i}>
                {i}
            </MenuItem>
        );
    }
    return items;
};

const Stock = ({ currentStock, handleChange, item }) => {
    if (currentStock === 0) {
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
                    value={item}
                    onChange={handleChange}
                    role="selecter"
                    name="quantity"
                >
                    {Selections(currentStock)}
                </Select>
            </FormControl>
        );
    }
};

export const CartCard = ({
    image,
    title,
    currentStock,
    closeChange,
    checkedOutQuantity,
    isError,
}) => {
    const [item, setItem] = React.useState(checkedOutQuantity);
    const handleChange = (event) => {
        setItem(event.target.value);
    };
    const errorMessage = isError === true ? "some error message" : "";
    var nameStyle = isError === true ? styles.CartErrorName : styles.CartName;
    nameStyle = currentStock === 0 ? styles.CartErrorName : nameStyle;

    return (
        <Card className={styles.Cart} elevation={0}>
            <CardMedia
                className={styles.CartPic}
                image={image}
                alt={title}
                component="img"
            />
            <CardContent className={styles.CartParts} elevation={0}>
                <Typography variant="body2" className={nameStyle}>
                    {title}
                </Typography>
                <Typography variant="caption" className={styles.CartError}>
                    {errorMessage}
                </Typography>
                <Stock
                    currentStock={currentStock}
                    handleChange={handleChange}
                    item={item}
                />
            </CardContent>
            <CardActions className={styles.CartAction}>
                <IconButton
                    size="small"
                    className={styles.CartClose}
                    onClick={closeChange}
                    role="close"
                >
                    <CloseIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default CartCard;
