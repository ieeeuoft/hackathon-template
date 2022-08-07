import React from "react";
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

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    return (
        <>
            <Header />

            <Grid container direction="column" spacing={6} xs={12}>
                <Grid item xs={12}>
                    <Typography variant="h1">
                        Team {match.params.id} Overview
                    </Typography>
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
        </>
    );
};

export default TeamDetail;
