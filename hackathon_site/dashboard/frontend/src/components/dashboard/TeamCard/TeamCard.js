import React from "react";
import styles from "./TeamCard.module.scss";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

const TeamCard = ({ members, teamCode, EditButton }) => {
    const title = teamCode === "" ? "Team" : "Team " + teamCode;

    return (
        <Container className={styles.TeamCard} maxWidth={false} disableGutters={true}>
            <Typography variant="h2">{title}</Typography>
            <Paper elevation={3} className={styles.paper} square={true}>
                {members.map((member, i) => (
                    <Container className={styles.name} key={i}>
                        <Typography variant="body2">{member}</Typography>
                    </Container>
                ))}

                <Container className={styles.lastRow}>
                    <Button className={styles.Button} onClick={EditButton}>
                        {" "}
                        Edit{" "}
                    </Button>
                </Container>
            </Paper>
        </Container>
    );
};

export default TeamCard;
