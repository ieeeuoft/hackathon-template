import React, { useEffect } from "react";

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
            </Grid>
        </>
    );
};

export default TeamDetail;
