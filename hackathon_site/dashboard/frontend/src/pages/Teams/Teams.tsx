import React, { useEffect } from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import styles from "pages/Teams/Teams.module.scss";

import TeamCardAdmin from "components/team/TeamCardAdmin/TeamCardAdmin";
import TeamSearchBar from "components/team/TeamSearchBar/TeamSearchBar";

import {
    getTeamNextPage,
    getTeamsWithSearchThunk,
    isLoadingSelector,
    isMoreLoadingSelector,
    teamAdminSelectors,
    teamCountSelector,
} from "slices/event/teamAdminSlice";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useHistory } from "react-router-dom";
import { Button, Divider } from "@material-ui/core";

const Teams = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const teamsList = useSelector(teamAdminSelectors.selectAll);
    const currNumTeams = useSelector(teamAdminSelectors.selectTotal);
    const count = useSelector(teamCountSelector);
    const isLoading = useSelector(isLoadingSelector);
    const isMoreLoading = useSelector(isMoreLoadingSelector);

    useEffect(() => {
        dispatch(getTeamsWithSearchThunk());
    }, [dispatch]);

    const getMoreTeams = async () => {
        dispatch(getTeamNextPage());
    };

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
            {isLoading ? (
                <CircularProgress size={25} data-testid="teams-circular-progress" />
            ) : (
                <Grid container>{CardComponents}</Grid>
            )}
            {count > 0 && (
                <Divider
                    className={styles.inventoryLoadDivider}
                    data-testid="inventoryCountDivider"
                />
            )}
            <Typography
                variant="subtitle2"
                align="center"
                paragraph
                style={{ marginTop: count <= 0 ? "30px" : 0 }}
            >
                {count > 0
                    ? `SHOWING ${currNumTeams} OF ${count} TEAMS`
                    : isLoading
                    ? "LOADING"
                    : "NO TEAMS FOUND"}
            </Typography>
            {count !== currNumTeams && (
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth={true}
                    disableElevation
                    onClick={getMoreTeams}
                >
                    {isMoreLoading ? (
                        <CircularProgress
                            size={25}
                            data-testid="load-more-teams-circular-progress"
                        />
                    ) : (
                        "Load more"
                    )}
                </Button>
            )}
        </>
    );
};

export default Teams;
