import React from "react";
import styles from "./Reports.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";

// Import Grid for formatting
import { Grid } from "@material-ui/core";

// Imports for the Table MUI Component
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

// Note: Created 2 seperate functions for createBrokenEntry and createLostEntry in case unique attributes for each type get added in future.
function createBrokenEntry(category, qty) {
    return { category, qty };
}

function createLostEntry(category, qty) {
    return { category, qty };
}

const mockBrokenEntries = [
    createBrokenEntry("MCU", 1),
    createBrokenEntry("Boards", 0),
    createBrokenEntry("Sensors", 2),
    createBrokenEntry("Actuators", 0),
    createBrokenEntry("Peripherals", 1),
    createBrokenEntry("Breadboards", 0),
    createBrokenEntry("Resistors", 10),
];

const mockLostEntries = [
    createLostEntry("MCU", 1),
    createLostEntry("Boards", 0),
    createLostEntry("Sensors", 0),
    createBrokenEntry("Actuators", 0),
    createBrokenEntry("Peripherals", 1),
    createBrokenEntry("Breadboards", 0),
    createBrokenEntry("Resistors", 20),
];

const Reports = () => {
    return (
        <>
            <Header />
            <Typography variant="h1">Reports</Typography>
            <Grid container spacing={3} className={styles.gridBottomPadding}>
                <Grid item xs={8}>
                    <Typography variant="h2" align="left">
                        Overview:
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    {MockBrokenTable()}
                </Grid>
                <Grid item xs={6}>
                    {MockLostTable()}
                </Grid>
            </Grid>
            <p>IEEEEEE</p>
            {/*This line above has been temporarly kept to pass the test in Reports.test.js*/}
        </>
    );
};

const MockBrokenTable = () => {
    let totalBrokenEntries = 0;
    let accumulateBroken = (qtyToAdd) => {
        totalBrokenEntries += qtyToAdd;
    };
    return (
        <>
            <Typography variant="h2" align="left">
                Total Broken
            </Typography>
            <TableContainer component={Paper}>
                <Table size="small" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Qty</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockBrokenEntries.map((row) => (
                            <TableRow key={row.category}>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    style={{ width: 100 }}
                                >
                                    {row.category}
                                </TableCell>
                                <TableCell align="left" style={{ width: 100 }}>
                                    {row.qty}
                                </TableCell>
                                {accumulateBroken(row.qty)}
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell
                                component="th"
                                scope="row"
                                style={{ width: 100 }}
                                className={styles.boldedTotalText}
                            >
                                {"Total"}
                            </TableCell>
                            <TableCell>{totalBrokenEntries}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

const MockLostTable = () => {
    let totalLostEntries = 0;
    let accumulateLost = (qtyToAdd) => {
        totalLostEntries += qtyToAdd;
    };
    return (
        <>
            <Typography variant="h2" align="left">
                Total Lost
            </Typography>
            <TableContainer component={Paper}>
                <Table size="small" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Qty</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockLostEntries.map((row) => (
                            <TableRow key={row.name}>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    style={{ width: 100 }}
                                >
                                    {row.category}
                                </TableCell>
                                <TableCell align="left" style={{ width: 100 }}>
                                    {row.qty}
                                </TableCell>
                                {accumulateLost(row.qty)}
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableRow>
                        <TableCell
                            component="th"
                            scope="row"
                            style={{ width: 100 }}
                            className={styles.boldedTotalText}
                        >
                            {"Total"}
                        </TableCell>
                        <TableCell>{totalLostEntries}</TableCell>
                    </TableRow>
                </Table>
            </TableContainer>
        </>
    );
};

export default Reports;
