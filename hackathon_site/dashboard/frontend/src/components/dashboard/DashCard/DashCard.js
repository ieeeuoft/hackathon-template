import React from "react";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./DashCard.module.scss";
import Link from "@material-ui/core/Link";
import TeamCard from "../TeamCard/TeamCard";

const CardItem = ({ name, icon }) => {
    return (
        <Container className={styles.items}>
            <Typography variant="body2">{name}</Typography>
            {icon}
        </Container>
    );
};

const DashCard = ({ title, content }) => {
    return (
        <Grid className={styles.DashCard} item>
            <Typography variant="h2">{title}</Typography>
            <Paper elevation={3} className={styles.paper} square={true}>
                {content.map((listItem, i) => (
                    <Link
                        href={listItem.url}
                        rel="noopener"
                        color="inherit"
                        underline="none"
                        target="_blank"
                        key={i}
                    >
                        <CardItem name={listItem.name} icon={listItem.icon} />
                    </Link>
                ))}
            </Paper>
        </Grid>
    );
};

export default DashCard;
