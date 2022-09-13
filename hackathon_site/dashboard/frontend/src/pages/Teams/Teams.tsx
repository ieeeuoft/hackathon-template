import React, { useEffect } from "react";
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
import { useHistory } from "react-router-dom";

const Teams = () => {
    const dispatch = useDispatch();
    const teamsList = useSelector(teamAdminSelectors.selectAll);
    const isAdminTeamsLoading = useSelector(isLoadingSelector);
    const history = useHistory();

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
            onClick={() => history.push(`/teams/${team.team_code}`)}
        >
            <TeamCardAdmin teamCode={team.team_code} members={team.profiles} />
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
