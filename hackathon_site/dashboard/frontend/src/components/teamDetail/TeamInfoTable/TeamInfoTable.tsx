import {
    Checkbox,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { mockTeamMultiple } from "testing/mockData";
import React from "react";

export const TeamInfoTable = () => {
    return (
        <Grid container direction="column" spacing={1} item md={6} xs={12}>
            <Grid item>
                <Typography variant="h2">Team info</Typography>
            </Grid>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell align="center">ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockTeamMultiple.profiles.map((row) => (
                            <TableRow key={row.user.id}>
                                <TableCell>
                                    {`${row.user.first_name} ${row.user.last_name}`}
                                </TableCell>
                                <TableCell>{row.user.email}</TableCell>
                                <TableCell>{row.user.phone}</TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        checked={row.id_provided}
                                        color="primary"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};

export default TeamInfoTable;
