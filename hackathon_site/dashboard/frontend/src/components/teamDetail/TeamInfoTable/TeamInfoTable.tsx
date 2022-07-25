import { RouteComponentProps } from "react-router-dom";

import {
    Button,
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
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addTeamOrder,
    getTeamInfoData,
    isLoadingSelector,
    setIsLoading,
    teamOrderAdaptorSelector,
} from "../../../slices/event/teamDetailSlice";

export const TeamInfoTable = (teamCode: { teamCode: string }) => {
    console.log(teamCode);
    const isTeamInfoLoading = useSelector(isLoadingSelector);
    const dispatch = useDispatch();
    const teamOrders = useSelector(teamOrderAdaptorSelector.selectAll);

    useEffect(() => {
        dispatch(
            addTeamOrder({
                orderId: 1,
                items: ["arduino", "sensor"],
            })
        );
    });

    useEffect(() => {
        dispatch(getTeamInfoData(teamCode));
    });
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
