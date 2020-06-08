import React from "react";
import Typography from "@material-ui/core/Typography";
import styles from "./Item.module.scss";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";

const colorCircle = ({ limit, currentStock }) => {
    if (currentStock === "") {
        return "";
    } else {
        // not sure how the limit would work for now
        let endStyle = "";
        if (limit === "1") {
            endStyle = styles.ItemLimit1;
        } else if (limit === "2") {
            endStyle = styles.ItemLimit2;
        } else if (limit === "3") {
            endStyle = styles.ItemLimit3;
        } else if (limit === "4") {
            endStyle = styles.ItemLimit4;
        } else if (limit === "5") {
            endStyle = styles.ItemLimit5;
        }
        return <FiberManualRecordIcon className={endStyle} />;
    }
};

const Item = ({ image, title, total, limit, currentStock }) => {
    const stock =
        currentStock === ""
            ? "OUT OF STOCK"
            : currentStock + " OF " + total + " IN STOCK";
    const stockStyle = stock === "OUT OF STOCK" ? styles.outOfStock : "";

    return (
        <Grid className={styles.Item} item>
            <Card className={styles.ItemPicBox} variant="outlined">
                <CardMedia
                    className={styles.ItemPic}
                    component="img"
                    alt={title}
                    image={image}
                    title={title}
                    src={image}
                />
            </Card>
            <div className={styles.ItemTextBox}>
                <div className={styles.ItemName}>
                    <colorCircle limit={limit} currentStock={currentStock} />
                    <Typography vairant="caption">{title}</Typography>
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
