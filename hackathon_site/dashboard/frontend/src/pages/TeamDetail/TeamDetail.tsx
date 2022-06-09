import React from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import { mockTeamMultiple } from "testing/mockData";
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Checkbox,
    Paper,
    Container,
    Grid,
} from "@material-ui/core";

const TeamDetail = () => {
    return (
        <>
            <Header />
            <Container>
                <Grid container direction="column" spacing={6}>
                    <Grid item>
                        <Typography variant="h1">
                            Team {mockTeamMultiple.id} Overview
                        </Typography>
                    </Grid>
                    {/* Team info and actions */}
                    <Grid container spacing={2}>
                        <Grid
                            container
                            direction="column"
                            spacing={1}
                            item
                            md={6}
                            xs={12}
                        >
                            <Grid item>
                                <Typography variant="h2">Team info</Typography>
                            </Grid>
                            <Grid item>
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Phone</TableCell>
                                                <TableCell>ID</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {mockTeamMultiple.profiles.map((row) => (
                                                <TableRow key={row.user.id}>
                                                    <TableCell>
                                                        {`${row.user.first_name} ${row.user.last_name}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.user.phone}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={row.id_provided}
                                                            color="primary"
                                                            style={{
                                                                marginLeft: "-15px",
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>

                        <Grid
                            container
                            spacing={1}
                            direction="column"
                            item
                            md={6}
                            xs={12}
                        >
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
            </Container>
        </>
    );
};

export default TeamDetail;
