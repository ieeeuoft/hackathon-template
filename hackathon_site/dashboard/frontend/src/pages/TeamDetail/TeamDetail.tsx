import React, { useEffect } from "react";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import TeamActionTable from "components/teamDetail/TeamActionTable/TeamActionTable";

import { RouteComponentProps } from "react-router-dom";
import Header from "components/general/Header/Header";
import { Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { getTeamInfoData } from "../../slices/event/teamDetailSlice";

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    // TODO: change api to use team_code instead of team_id
    const teamCode = match.params.id;
    // dispatch thunk here, it will populate store, then call the selector in teamInfoComponent to get team info data
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getTeamInfoData(teamCode));
    });

    return (
        <>
            <Header />

            <Grid container item direction="column" spacing={6} xs={12}>
                <Grid item xs={12}>
                    <Typography variant="h1">Team {teamCode} Overview</Typography>
                </Grid>

                <Grid
                    item
                    container
                    spacing={2}
                    justifyContent="space-between"
                    xs={12}
                    style={{
                        alignSelf: "center",
                    }}
                >
                    <TeamInfoTable />
                    <TeamActionTable />
                </Grid>
            </Grid>
        </>
    );
};

export default TeamDetail;
