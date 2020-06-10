import React from "react";
import styles from "./CartCard.module.scss";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
    Card,
    CardMedia,
    Select,
    FormControl,
    MenuItem,
    IconButton,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const Selections = ({ currentStock, limit }) => {
    currentStock = currentStock === null ? 0 : currentStock;
    let stock = currentStock;
    stock = limit > currentStock ? currentStock : limit;
    const items = [];
    let i = 0;

    for (i = 2; i < stock + 1; i++) {
        items.push(i);
    }

    return items.map((item, k) => (
        <MenuItem val={item} key={k}>
            {" "}
            {item}{" "}
        </MenuItem>
    ));
};

const CartCard = ({ image, title, limit, total, currentStock }) => {
    const [item, setItem] = React.useState("1");

    const handleChange = (event) => {
        setItem(event.target.value);
    };

    return (
        <Grid item>
            <Card className={styles.Cart} outline="outlined">
                <Card className={styles.CartPic} outline="outlined">
                    <CardMedia
                        className={styles.CartPic}
                        component="img"
                        image={image}
                        title={title}
                    />
                </Card>
                <div className={styles.CartParts}>
                    <Typography variant="body2" className={styles.CartName}>
                        {title}
                    </Typography>
                    <FormControl
                        className={styles.CartFormSelect}
                        size="small"
                        variant="outlined"
                    >
                        <Select size="small" value={item} onChange={handleChange}>
                            <MenuItem value={1}>1</MenuItem>
                            <Selections currentStock={currentStock} limit={limit} />
                        </Select>
                    </FormControl>
                </div>
                <IconButton size="small" className={styles.CartClose}>
                    <CloseIcon />
                </IconButton>
            </Card>
        </Grid>
    );
};

export default CartCard;
