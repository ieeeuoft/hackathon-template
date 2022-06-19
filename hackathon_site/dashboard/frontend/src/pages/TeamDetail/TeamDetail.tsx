import React from "react";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";

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
import TeamPendingOrderTable from "../../components/teamDetail/TeamPendingOrderTable/TeamPendingOrderTable";

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

                <Grid item container direction="row" spacing={2}>
                    <TeamInfoTable />
                    <Grid container spacing={1} direction="column" item md={6} xs={12}>
                        <Grid item>
                            <Typography variant="h2">Dummy</Typography>
                        </Grid>
                        <Grid item>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Dummy</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <TeamPendingOrderTable />
                </Grid>
            </Grid>
        </>
    );
};

export default TeamDetail;
