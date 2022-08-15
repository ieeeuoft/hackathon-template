import React, { useEffect } from "react";
import styles from "./TeamDetail.module.scss";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import TeamActionTable from "components/teamDetail/TeamActionTable/TeamActionTable";

import { RouteComponentProps } from "react-router-dom";
import Header from "components/general/Header/Header";
import { Grid, Divider } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {
    AdminReturnedItemsTable,
    SimplePendingOrderFulfillmentTable,
} from "components/teamDetail/SimpleOrderTables/SimpleOrderTables";

import { useDispatch, useSelector } from "react-redux";
import { errorSelector, getTeamInfoData } from "slices/event/teamDetailSlice";
import AlertBox from "components/general/AlertBox/AlertBox";

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    // TODO: change api to use team_code instead of team_id
    const teamCode = match.params.id;
    const error = useSelector(errorSelector);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getTeamInfoData(teamCode));
    }, [dispatch, teamCode]);

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
                        <SimplePendingOrderFulfillmentTable />
                        <Divider className={styles.dividerMargin} />
                        <AdminReturnedItemsTable />
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default TeamDetail;
