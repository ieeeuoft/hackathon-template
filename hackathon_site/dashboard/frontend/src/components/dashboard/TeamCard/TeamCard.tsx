import React from "react";
import styles from "./TeamCard.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TitledPaper from "components/general/TitledPaper/TitledPaper";

interface TeamProps {
    members?: string[];
    teamCode?: string;
}

const TeamCard = ({ members, teamCode }: TeamProps) => {
    const title = teamCode === "" ? "Team" : "Team " + teamCode;
    // waiting for the team store
    if (!members) {
        return null;
    }
    return (
        <TitledPaper title={title}>
            {members?.map((member, i) => (
                <Container className={styles.name} key={i}>
                    <Typography variant="body2" noWrap>
                        {member}
                    </Typography>
                </Container>
            ))}
        </TitledPaper>
    );
};

export default TeamCard;
