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
    errorSelector,
    getAdminTeamOrders,
    hardwareInOrdersSelector,
} from "slices/order/teamOrderSlice";

import { useDispatch, useSelector } from "react-redux";
import {
    getTeamInfoData,
    teamInfoErrorSelector,
    updateParticipantIdErrorSelector,
} from "slices/event/teamDetailSlice";
import AlertBox from "components/general/AlertBox/AlertBox";
import TeamCheckedOutOrderTable from "components/teamDetail/TeamCheckedOutOrderTable/TeamCheckedOutOrderTable";
import { getHardwareWithFilters, setFilters } from "slices/hardware/hardwareSlice";

export interface PageParams {
    code: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    const dispatch = useDispatch();

    const hardwareIdsRequired = useSelector(hardwareInOrdersSelector);
    const teamCode = match.params.code.toUpperCase();
    const teamInfoError = useSelector(teamInfoErrorSelector);
    const orderError = useSelector(errorSelector);

    const updateParticipantIdError = useSelector(updateParticipantIdErrorSelector);
    if (
        updateParticipantIdError === "Could not update participant id status: Error 404"
    ) {
        dispatch(getTeamInfoData(teamCode));
    }

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
            {teamInfoError ? (
                <AlertBox error={teamInfoError} />
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
                        {orderError ? (
                            <AlertBox error={orderError} />
                        ) : (
                            <>
                                <SimplePendingOrderFulfillmentTable />
                                <Divider className={styles.dividerMargin} />
                                <TeamCheckedOutOrderTable />
                                <Divider className={styles.dividerMargin} />
                                <AdminReturnedItemsTable />
                            </>
                        )}
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default TeamDetail;
