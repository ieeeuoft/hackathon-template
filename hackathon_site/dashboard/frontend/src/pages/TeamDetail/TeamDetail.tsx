import React from "react";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import TeamActionTable from "components/teamDetail/TeamActionTable/TeamActionTable";

import { RouteComponentProps } from "react-router-dom";
import Header from "components/general/Header/Header";
import {
    Grid,
    Paper,
    Table,
    TableContainer,
    TableBody,
    TableRow,
    TableCell,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    return (
        <>
            <Header />

            <Grid container direction="column" spacing={6}>
                <Grid item>
                    <Typography variant="h1">
                        Team {match.params.id} Overview
                    </Typography>
                </Grid>

                <Grid item container direction="row" justifyContent="space-between">
                    <TeamInfoTable />
                    <TeamActionTable />
                </Grid>
            </Grid>
        </>
    );
};

export default TeamDetail;
