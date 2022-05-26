import React from "react";
// import styles from "./Teams.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import styles from "../Dashboard/Dashboard.module.scss";
import TeamCardAdmin from "../../components/dashboard/TeamCardAdmin/TeamCardAdmin";

const Teams = () => {
    const mock_data = [
        {
            TeamName: "Moo",
            Members: ["Rosalyn Wong", "Mohaimen Khan"],
        },
        {
            TeamName: "Oliver",
            Members: ["Raymond Kim", "Lisa Li"],
        },
        {
            TeamName: "Mochi",
            Members: ["Eric Ji", "Avelyn Wong"],
        },
    ];

    const CardComponents = mock_data.map((team) => (
        <Grid
            item
            md={3}
            sm={4}
            xs={6}
            className={styles.dashboardGridItem}
            key={0}
            data-testid="team"
        >
            <TeamCardAdmin
                team_name={team.TeamName}
                members={team.Members}
            ></TeamCardAdmin>
        </Grid>
        // <TeamCardAdmin team_name={team.TeamName} members={team.Members}></TeamCardAdmin>
    ));

    return (
        <>
            <Header />
            <Typography variant="h1">Teams</Typography>
            {CardComponents}
        </>
    );
};

export default Teams;
