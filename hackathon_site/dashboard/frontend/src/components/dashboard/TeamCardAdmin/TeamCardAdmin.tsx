import React from "react";
import styles from "./TeamCardAdmin.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";

import TitledPaper from "components/general/TitledPaper/TitledPaper";

interface CardProps {
    team_name?: string;
    members?: string[];
}

export const TeamCardAdmin = ({ team_name, members }: CardProps) => {
    const title = team_name === null ? "No Team" : "Team " + team_name;

    return (
        // <TitledPaper title={title}>
        //     {members?.length
        //         ? members?.map((member, i) => (
        //               <Container className={styles.name} key={i}>
        //                   <Typography variant="body2" noWrap>
        //                       {member}
        //                   </Typography>
        //               </Container>
        //           ))
        //         : null}
        // </TitledPaper>

        <Card style={{ minHeight: "200px" }}>
            <Container className={styles.content_container}>
                <Container className={styles.title}>
                    <Typography variant={"h6"}>{title}</Typography>
                </Container>
                {members?.length
                    ? members?.map((member, i) => (
                          <Container className={styles.name} key={i}>
                              <Typography variant="body2" noWrap>
                                  {member}
                              </Typography>
                          </Container>
                      ))
                    : null}
            </Container>
        </Card>
    );
};

export default TeamCardAdmin;
