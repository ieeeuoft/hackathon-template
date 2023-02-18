import React, { ReactElement } from "react";
import Typography from "@material-ui/core/Typography";
import styles from "./Item.module.scss";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import { useSelector } from "react-redux";
import { userTypeSelector } from "slices/users/userSlice";

interface ItemProps {
    image: string;
    title: string;
    total: number;
    currentStock: number;
}

const Item = ({ image, title, total, currentStock }: ItemProps): ReactElement => {
    const userType = useSelector(userTypeSelector);
    const stock =
        currentStock < 1
            ? "OUT OF STOCK"
            : userType === "participant"
            ? currentStock + " IN STOCK"
            : currentStock + " OF " + total + " IN STOCK";
    const stockStyle = !currentStock ? styles.outOfStock : styles.inStock;
    const coverStyle = !currentStock ? styles.itemBlack : styles.itemBox;

    return (
        <div className={styles.itemGrid}>
            <Card className={coverStyle} elevation={2} square={true}>
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
        </div>
    );
};

export default Item;
