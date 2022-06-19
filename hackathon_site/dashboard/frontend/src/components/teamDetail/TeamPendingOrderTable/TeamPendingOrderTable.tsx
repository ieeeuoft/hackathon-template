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
import { mockPendingOrders } from "testing/mockData";
import React from "react";
import Container from "@material-ui/core/Container";

export const TeamPendingOrderTable = () => {
    return (
        <Container maxWidth={false} disableGutters={true}>
            {mockPendingOrders.map((pendingOrder) => (
                <Grid container direction="column" spacing={1} item md={6} xs={12}>
                    <Grid item>
                        <Typography variant="h2">{`Order #${pendingOrder.id}`}</Typography>
                    </Grid>
                    <Grid item></Grid>
                </Grid>
            ))}
        </Container>
    );
};

export default TeamPendingOrderTable;
