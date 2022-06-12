import React from "react";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";

import { RouteComponentProps, useHistory, useLocation } from "react-router-dom";
import Header from "components/general/Header/Header";
import { Grid, Paper, Table, TableContainer } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    const history = useHistory();
    const location = useLocation();

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
                    <TeamInfoTable
                        match={match}
                        history={history}
                        location={location}
                    />
                    <Grid container spacing={1} direction="column" item md={6} xs={12}>
                        <Grid item>
                            <Typography variant="h2">Dummy</Typography>
                        </Grid>
                        <Grid item>
                            <TableContainer component={Paper}>
                                <Table>Dummy</Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};

export default TeamDetail;
