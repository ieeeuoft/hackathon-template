import React, { useEffect } from "react";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import TeamActionTable from "components/teamDetail/TeamActionTable/TeamActionTable";

import { RouteComponentProps } from "react-router-dom";
import Header from "components/general/Header/Header";
import { Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { getAdminTeamOrders } from "slices/order/teamOrderSlice";

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    const dispatch = useDispatch();
    const teamCode = match.params.id;

    useEffect(() => {
        dispatch(getAdminTeamOrders(teamCode));
    }, [dispatch]);

    return (
        <>
            <Header />
            <Grid container direction="column" spacing={6}>
                <Grid item>
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
