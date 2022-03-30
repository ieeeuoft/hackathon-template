import React from "react";
import styles from "./TeamCard.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import TitledPaper from "components/general/TitledPaper/TitledPaper";
import Button from "@material-ui/core/Button";
import { useSelector } from "react-redux";
import { teamCodeSelector, teamMemberNamesSelector } from "slices/event/teamSlice";

interface TeamProps {
    handleEditTeam?: any;
}

export const TeamCard = ({ handleEditTeam }: TeamProps) => {
    const members = useSelector(teamMemberNamesSelector);
    const teamCode = useSelector(teamCodeSelector);

    const title = teamCode === null ? "No Team" : "Team " + teamCode;
    // waiting for the team store
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
            <Container className={styles.lastRow}>
                <Button
                    color="primary"
                    onClick={handleEditTeam}
                    data-testid="teamCardBtn"
                >
                    Edit
                </Button>
            </Container>
        </TitledPaper>
    );
};

export default TeamCard;
