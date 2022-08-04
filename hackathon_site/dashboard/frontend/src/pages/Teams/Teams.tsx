import React, { useEffect } from "react";
// import styles from "./Teams.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import styles from "pages/Teams/Teams.module.scss";

import TeamCardAdmin from "components/team/TeamCardAdmin/TeamCardAdmin";
import TeamSearchBar from "components/team/TeamSearchBar/TeamSearchBar";
import {
    getAllTeams,
    isLoadingSelector,
    teamAdminSelectors,
} from "slices/event/teamAdminSlice";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";

const Teams = () => {
    const dispatch = useDispatch();
    const teamsList = useSelector(teamAdminSelectors.selectAll);
    const isAdminTeamsLoading = useSelector(isLoadingSelector);

    useEffect(() => {
        dispatch(getAllTeams());
    }, [dispatch]);

    const CardComponents = teamsList.map((team, index) => (
        <Grid
            item
            md={3}
            sm={4}
            xs={12}
            xl={2}
            key={index}
            className={styles.teamsListGridItem}
            grid-template-column="true"
            onClick={() => alert(`Goes to team-detail for team ${team.team_code}`)}
        >
            <TeamCardAdmin
                teamCode={team.team_code}
                members={team.profiles.map(
                    (member) => `${member.user.first_name} ${member.user.last_name}`
                )}
            />
        </Grid>
    ));

    return (
        <>
            <Header />
            <Typography variant="h1">Teams</Typography>
            <TeamSearchBar />
            {isAdminTeamsLoading ? (
                <CircularProgress size={25} data-testid="teams-circular-progress" />
            ) : (
                <Grid container>{CardComponents}</Grid>
            )}
        </>
    );
};

export default Teams;
