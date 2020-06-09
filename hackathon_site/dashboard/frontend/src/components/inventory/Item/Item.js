import React from "react";
import Typography from "@material-ui/core/Typography";
import styles from "./Item.module.scss";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Grid from "@material-ui/core/Grid";

const ColorCircle = ({ limit }) => {
    // not sure how the limit would work for now
    let endStyle = "";
    switch (limit) {
        case 1:
            endStyle = styles.ItemLimit1;
            break;
        case 2:
            endStyle = styles.ItemLimit2;
            break;
        case 3:
            endStyle = styles.ItemLimit3;
            break;
        case 4:
            endStyle = styles.ItemLimit4;
            break;
        case 5:
            endStyle = styles.ItemLimit5;
            break;
        default:
            endStyle = styles.ItemLimit;
    }
    return <FiberManualRecordIcon className={endStyle} />;
};

const Item = ({ image, title, total, limit, currentStock }) => {
    const stock =
        currentStock === null
            ? "OUT OF STOCK"
            : currentStock + " OF " + total + " IN STOCK";
    const stockStyle = stock === "OUT OF STOCK" ? styles.outOfStock : styles.inStock;

    return (
        <Grid className={styles.Item} item>
            <Card className={styles.ItemPicBox} variant="outlined" square={true}>
                <CardMedia
                    className={styles.ItemPic}
                    component="img"
                    alt={title}
                    image={image}
                />
            </Card>
            <div className={styles.ItemTextBox}>
                <div className={styles.ItemName}>
                    <ColorCircle limit={limit} />
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
