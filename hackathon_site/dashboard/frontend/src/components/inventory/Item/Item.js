import React from "react";
import Typography from "@material-ui/core/Typography";
import styles from "./Item.module.scss";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";

const Item = ({ image, title, total, currentStock }) => {
    const stock = !currentStock
        ? "OUT OF STOCK"
        : currentStock + " OF " + total + " IN STOCK";
    const stockStyle = !currentStock ? styles.outOfStock : styles.inStock;
    const coverStyle = !currentStock ? styles.ItemPicBox : "";

    return (
        <Grid className={styles.Item} item>
            <Card className={coverStyle} variant="outlined" square={true}>
                <CardMedia
                    className={styles.ItemPic}
                    component="img"
                    alt={title}
                    image={image}
                />
            </Card>
            <div className={styles.ItemTextBox}>
                <div className={styles.ItemName}>
                    <Typography variant="body2">{title}</Typography>
                </div>
                <Typography variant="caption" className={stockStyle}>
                    {stock}
                </Typography>
            </div>
        </Grid>
    );
};

export default Item;

/*
image => the image of the component
title => the title of the component
total => total number of the component
limit => the limit of the component, would change the color at the beginning (if exists)
currentStock => how much we have left in stock
*/
