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
import { useDispatch, useSelector } from "react-redux";
import {
    isParticipantIdLoadingSelector,
    isTeamInfoLoadingSelector,
    teamDetailAdapterSelector,
    updateParticipantIdProvided,
} from "slices/event/teamDetailSlice";

export const TeamInfoTable = () => {
    const dispatch = useDispatch();
    const isTeamInfoLoading: boolean = useSelector(isTeamInfoLoadingSelector);
    const isParticipantIdLoading: boolean = useSelector(isParticipantIdLoadingSelector);
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
                                            disabled={isParticipantIdLoading}
                                            data-testid={`id-provided-check-${row.id}`}
                                            onChange={(event) => {
                                                dispatch(
                                                    updateParticipantIdProvided({
                                                        profileId: row.id,
                                                        idProvided: !row.id_provided,
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
