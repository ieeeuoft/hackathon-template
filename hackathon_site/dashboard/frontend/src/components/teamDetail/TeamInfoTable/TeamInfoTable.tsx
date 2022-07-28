import {
    Checkbox,
    Grid,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { useSelector } from "react-redux";
import {
    isLoadingSelector,
    teamDetailAdapterSelector,
} from "slices/event/teamDetailSlice";

export const TeamInfoTable = () => {
    const isTeamInfoLoading = useSelector(isLoadingSelector);
    const teamInfo = useSelector(teamDetailAdapterSelector.selectAll) as any[];

    return (
        <Grid container direction="column" spacing={1} item md={6} xs={12}>
            <Grid item>
                <Typography variant="h2">Team info</Typography>
            </Grid>
            {isTeamInfoLoading ? (
                <LinearProgress data-testid="team-info-linear-progress" />
            ) : (
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
                            {teamInfo.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {`${row.user.first_name} ${row.user.last_name}`}
                                    </TableCell>
                                    <TableCell>{row.user.email}</TableCell>
                                    <TableCell>802-207-9999</TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.id_provided}
                                            color="primary"
                                            role="checkbox"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Grid>
    );
};

export default TeamInfoTable;
