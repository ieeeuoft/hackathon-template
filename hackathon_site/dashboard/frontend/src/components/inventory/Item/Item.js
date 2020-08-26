import React from "react";
import Typography from "@material-ui/core/Typography";
import styles from "./Item.module.scss";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";

const Item = ({ image, title, total, currentStock }) => {
    const stock = !currentStock
        ? "OUT OF STOCK"
        : currentStock + " OF " + total + " IN STOCK";
    const stockStyle = !currentStock ? styles.outOfStock : styles.inStock;
    const coverStyle = !currentStock ? styles.itemBlack : styles.itemBox;

    return (
        <>
            <Card className={coverStyle} variant="outlined" square={true}>
                <CardMedia
                    className={styles.itemPic}
                    component="img"
                    alt={title}
                    image={image}
                />
            </Card>
            <div className={styles.itemTextBox}>
                <Typography variant="body2">{title}</Typography>
                <Typography variant="caption" className={stockStyle}>
                    {stock}
                </Typography>
            </div>
        </>
    );
};

export default Item;
