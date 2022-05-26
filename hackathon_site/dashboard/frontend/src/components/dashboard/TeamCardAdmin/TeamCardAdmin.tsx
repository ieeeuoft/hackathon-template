import React from "react";
import styles from "./TeamCardAdmin.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TitledPaper from "components/general/TitledPaper/TitledPaper";

interface CardProps {
    team_name?: string;
    members?: string[];
}

export const TeamCardAdmin = ({ team_name, members }: CardProps) => {
    const title = team_name === null ? "No Team" : "Team " + team_name;

    return (
        <TitledPaper title={title}>
            {members?.length
                ? members?.map((member, i) => (
                      <Container className={styles.name} key={i}>
                          <Typography variant="body2" noWrap>
                              {member}
                          </Typography>
                      </Container>
                  ))
                : null}
        </TitledPaper>
    );
};

export default TeamCardAdmin;
