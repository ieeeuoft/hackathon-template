import React from "react";
import styles from "./TeamCardAdmin.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import { ProfileWithUser } from "api/types";

interface CardProps {
    teamCode: string;
    members: ProfileWithUser[];
}

export const TeamCardAdmin = ({ teamCode, members }: CardProps) => {
    return (
        <Card style={{ minHeight: "200px" }}>
            <Container className={styles.content_container}>
                <Container className={styles.title}>
                    <Typography variant={"h6"}>{`Team ${teamCode}`}</Typography>
                </Container>
                {members.length
                    ? members.map((member, i) => (
                          <Container className={styles.name} key={i}>
                              <Typography variant="body2">{`${member.user.first_name} ${member.user.last_name}`}</Typography>
                          </Container>
                      ))
                    : null}
            </Container>
        </Card>
    );
};

export default TeamCardAdmin;
