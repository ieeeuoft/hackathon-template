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
import {
    getAdminTeamOrders,
    hardwareInOrdersSelector,
} from "slices/order/teamOrderSlice";

import { useDispatch, useSelector } from "react-redux";
import { errorSelector, getTeamInfoData } from "slices/event/teamDetailSlice";
import AlertBox from "components/general/AlertBox/AlertBox";
import { getHardwareWithFilters, setFilters } from "slices/hardware/hardwareSlice";

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    const dispatch = useDispatch();

    const teamCode = match.params.id;
    const error = useSelector(errorSelector);
    const hardwareIdsRequired = useSelector(hardwareInOrdersSelector);

    useEffect(() => {
        dispatch(getTeamInfoData(teamCode));
        dispatch(getAdminTeamOrders(teamCode));
    }, [dispatch, teamCode]);

    useEffect(() => {
        if (hardwareIdsRequired) {
            dispatch(setFilters({ hardware_ids: hardwareIdsRequired }));
            dispatch(getHardwareWithFilters());
        }
    }, [dispatch, hardwareIdsRequired]);

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
