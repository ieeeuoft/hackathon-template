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
    Paper,
    InputLabel,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const Selections = ({ currentStock }) => {
    const items = [];
    let i = 0;

    for (i = 2; i < currentStock + 1; i++) {
        items.push(i);
    }

    return items.map((item, k) => (
        <MenuItem val={item} key={k}>
            {item}
        </MenuItem>
    ));
};

const CartCard = ({ image, title, currentStock, OnClickChange }) => {
    const [item, setItem] = React.useState("1");

    const handleChange = (event) => {
        setItem(event.target.value);
    };

    return (
        <Grid className={styles.Cart} item>
            <Paper className={styles.Cart} elevation={0}>
                <CardMedia className={styles.CartPic} image={image} title={title} />
            </Paper>
            <Card className={styles.CartParts} elevation={0}>
                <Typography variant="body2" className={styles.CartName}>
                    {" "}
                    {title}{" "}
                </Typography>
                <FormControl
                    variant="outlined"
                    size="small"
                    className={styles.CartFormControl}
                >
                    <InputLabel shrink={true} id="Qty">
                        {" "}
                        Qty{" "}
                    </InputLabel>
                    <Select labelId="Qty" value={item} onChange={handleChange}>
                        <MenuItem value={1}>1</MenuItem>
                        <Selections currentStock={currentStock} />
                    </Select>
                </FormControl>
            </Card>
            <IconButton
                size="small"
                className={styles.CartClose}
                onClick={OnClickChange}
            >
                <CloseIcon className={styles.CartClose} />
            </IconButton>
        </Grid>
    );
};

export default CartCard;
