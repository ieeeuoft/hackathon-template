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
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    isLoadingSelector,
    teamDetailAdapterSelector,
    updateParticipantIdProvided,
} from "slices/event/teamDetailSlice";

export const TeamInfoTable = () => {
    const dispatch = useDispatch();
    const isTeamInfoLoading: boolean = useSelector(isLoadingSelector);
    const profiles = useSelector(teamDetailAdapterSelector.selectAll);

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
                            {profiles.map((row, index) => (
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
                                            disabled={isTeamInfoLoading}
                                            data-testid="checkbox"
                                            onChange={(event) => {
                                                dispatch(
                                                    updateParticipantIdProvided({
                                                        profileId: row.id,
                                                        idProvided: row.id_provided,
                                                        attended: row.attended,
                                                    })
                                                );
                                            }}
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
