import React, { useEffect } from "react";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import TeamActionTable from "components/teamDetail/TeamActionTable/TeamActionTable";

import { RouteComponentProps } from "react-router-dom";
import Header from "components/general/Header/Header";
import { Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { getAdminTeamOrders } from "slices/order/teamOrderSlice";

import { useDispatch, useSelector } from "react-redux";
import { errorSelector, getTeamInfoData } from "slices/event/teamDetailSlice";
import AlertBox from "components/general/AlertBox/AlertBox";

import TeamPendingOrderTable from "components/teamDetail/TeamPendingOrderTable/TeamPendingOrderTable";
import TeamCheckedOutOrderTable from "components/teamDetail/TeamCheckedOutOrderTable/TeamCheckedOutOrderTable";

export interface PageParams {
    code: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    const dispatch = useDispatch();

    const teamCode = match.params.code;
    const error = useSelector(errorSelector);
    useEffect(() => {
        dispatch(getTeamInfoData(teamCode));
    }, [dispatch, teamCode]);

    useEffect(() => {
        if (!error) {
            dispatch(getAdminTeamOrders(teamCode));
        }
    }, [dispatch]);

    return (
        <>
            <Header />
            {error ? (
                <AlertBox error={error} />
            ) : (
                <Grid container direction="column" spacing={6}>
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
                    <Grid item container direction="column" spacing={2}>
                        <TeamPendingOrderTable />
                    </Grid>
                    <Grid item container direction="column" spacing={2}>
                        <TeamCheckedOutOrderTable />
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default TeamDetail;
