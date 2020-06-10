import React from "react";
import styles from "./TeamCard.module.scss";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

const TeamCard = ({ members, teamCode, handleEditTeam }) => {
    const title = teamCode === "" ? "Team" : "Team " + teamCode;

    return (
        <Grid className={styles.TeamCard} item>
            <Typography variant="h2">{title}</Typography>
            <Paper elevation={3} className={styles.paper} square={true}>
                {members.map((member, i) => (
                    <Container className={styles.name} key={i}>
                        <Typography variant="body2">{member}</Typography>
                    </Container>
                ))}

                <Container className={styles.lastRow}>
                    <Button className={styles.ButtonColor} onClick={handleEditTeam}>
                        Edit
                    </Button>
                </Container>
            </Paper>
        </Grid>
    );
};

export default TeamCard;
