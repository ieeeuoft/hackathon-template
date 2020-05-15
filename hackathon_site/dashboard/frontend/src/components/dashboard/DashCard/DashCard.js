import React from "react";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import styles from "./DashCard.module.scss";
import Link from '@material-ui/core/Link';

const ItemIcon = (url, icon) => {
    return{

    }
}

const CardItem = (name, url, icon) => {
    return (
        <Container>
            <Typography variant="body2">{name}</Typography>
            <ItemIcon url={url} icon={icon} />
        </Container>
    );
}

const preventDefault = (event) => event.preventDefault();

const DashCard = (title, {list) => {
    const createList = list;
    const cardItem = list.map((listItem)=>
        <Link href={listItem.url} onClick={preventDefault}>
            <CardItem name={listItem.name} icon={listItem.icon} />
        </Link>
    );

    return (
        <Container className={styles.DashCard} maxWidth={false} disableGutters={true}>
            <h2>{title}</h2>
            <Paper elevation={3} className={styles.paper} square={true}>
                {cardItem}
            </Paper>
        </Container>
    );
}

export default DashCard;
