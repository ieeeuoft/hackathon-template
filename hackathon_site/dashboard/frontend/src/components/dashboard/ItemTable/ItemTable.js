import React from "react";
import styles from "./ItemTable.module.scss";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Info from "@material-ui/icons/Info";
import Error from "@material-ui/icons/Error";
import WatchLater from "@material-ui/icons/WatchLater";
import CheckCircle from "@material-ui/icons/CheckCircle";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import {
    isCheckedOutTableVisibleSelector,
    isReturnedTableVisibleSelector,
    toggleCheckedOutTable,
    toggleReturnedTable,
} from "slices/ui/uiSlice";

export const ChipStatus = ({ status }) => {
    switch (status) {
        case "ready":
            return (
                <Chip
                    icon={<CheckCircle />}
                    label="Ready for pickup"
                    className={`${styles.chipGreen} ${styles.chip}`}
                />
            );
        case "pending":
            return (
                <Chip
                    icon={<WatchLater />}
                    label="In progress"
                    className={`${styles.chipOrange} ${styles.chip}`}
                />
            );
        case "error":
            return (
                <Chip
                    icon={<Error />}
                    label="Please visit the tech station"
                    className={`${styles.chipRed} ${styles.chip}`}
                />
            );
        default:
            return null;
    }
};

export const UnconnectedCheckedOutTable = ({
    items,
    isVisible,
    toggleVisibility,
    push,
    reportIncident,
}) => (
    <Container className={styles.tableContainer} maxWidth={false} disableGutters={true}>
        <div className={styles.title}>
            <Typography variant="h2" className={styles.titleText}>
                Checked out items
            </Typography>
            <Button
                onClick={() => {
                    toggleVisibility();
                }}
                color="primary"
            >
                {isVisible ? "Hide all" : "Show all"}
            </Button>
        </div>

        {isVisible &&
            (!items.length ? (
                <Paper elevation={3} className={styles.empty} square={true}>
                    You have no items checked out yet. View our inventory.
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={3} square={true}>
                    <Table
                        className={styles.table}
                        size="small"
                        aria-label="checkout table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.widthFixed} />
                                <TableCell className={styles.widthHalf} align="left">
                                    Name
                                </TableCell>
                                <TableCell className={styles.widthFixed} align="center">
                                    Info
                                </TableCell>
                                <TableCell className={styles.widthFixed} align="right">
                                    Qty
                                </TableCell>
                                <TableCell className={styles.widthButton} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell align="left">
                                        <img
                                            className={styles.itemImg}
                                            src={row.url}
                                            alt={row.name}
                                        />
                                    </TableCell>
                                    <TableCell align="left">{row.name}</TableCell>
                                    <TableCell align="left">
                                        <IconButton
                                            color="inherit"
                                            aria-label="Info"
                                            onClick={() => {
                                                alert("this would open the drawer");
                                            }}
                                        >
                                            <Info />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell align="right">{row.qty}</TableCell>
                                    <TableCell
                                        align="right"
                                        className={styles.widthButton}
                                    >
                                        <Button
                                            color="secondary"
                                            onClick={() => {
                                                reportIncident(row.id);
                                                push("/incident-form");
                                            }}
                                        >
                                            Report broken/lost
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ))}
    </Container>
);

const checkedOutMapStateToProps = (state) => ({
    isVisible: isCheckedOutTableVisibleSelector(state),
});

export const CheckedOutTable = connect(checkedOutMapStateToProps, {
    toggleVisibility: toggleCheckedOutTable,
    push,
})(UnconnectedCheckedOutTable);

export const UnconnectedReturnedTable = ({ items, isVisible, toggleVisibility }) => (
    <Container className={styles.tableContainer} maxWidth={false} disableGutters={true}>
        <div className={styles.title}>
            <Typography variant="h2" className={styles.titleText}>
                Returned items
            </Typography>
            <Button
                onClick={() => {
                    toggleVisibility();
                }}
                color="primary"
            >
                {isVisible ? "Hide all" : "Show all"}
            </Button>
        </div>

        {isVisible &&
            (!items.length ? (
                <Paper elevation={3} className={styles.empty} square={true}>
                    Please bring items to the tech table and a tech team member will
                    assist you.
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={3} square={true}>
                    <Table
                        className={styles.table}
                        size="small"
                        aria-label="returned table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.widthFixed} />
                                <TableCell className={styles.widthHalf} align="left">
                                    Name
                                </TableCell>
                                <TableCell className={styles.widthFixed} align="left">
                                    Qty
                                </TableCell>
                                <TableCell
                                    className={styles.widthQuarter}
                                    align="right"
                                >
                                    Time
                                </TableCell>
                                <TableCell className={styles.widthQuarter} align="left">
                                    Condition
                                </TableCell>
                                <TableCell className={styles.widthBuffer} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell align="left">
                                        <img
                                            className={styles.itemImg}
                                            src={row.url}
                                            alt={row.name}
                                        />
                                    </TableCell>
                                    <TableCell align="left">{row.name}</TableCell>
                                    <TableCell align="right">{row.qty}</TableCell>
                                    <TableCell align="right">{row.time}</TableCell>
                                    <TableCell align="left">{row.condition}</TableCell>
                                    <TableCell className={styles.widthBuffer} />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ))}
    </Container>
);

const returnedTableMapStateToProps = (state) => ({
    isVisible: isReturnedTableVisibleSelector(state),
});

export const ReturnedTable = connect(returnedTableMapStateToProps, {
    toggleVisibility: toggleReturnedTable,
})(UnconnectedReturnedTable);

export const PendingTable = ({ items, status }) => {
    return !status ? null : (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            <div className={styles.titleChip}>
                <Typography variant="h2" className={styles.titleText}>
                    Orders pending
                </Typography>
                <ChipStatus status={status} />
            </div>
            <TableContainer component={Paper} elevation={3} square={true}>
                <Table className={styles.table} size="small" aria-label="pending table">
                    <TableHead>
                        <TableRow>
                            <TableCell className={styles.widthFixed} />
                            <TableCell className={styles.widthHalf} align="left">
                                Name
                            </TableCell>
                            <TableCell className={styles.widthQuarter} align="right">
                                Requested Qty
                            </TableCell>
                            <TableCell className={styles.widthQuarter} align="right">
                                Granted Qty
                            </TableCell>
                            <TableCell className={styles.widthBuffer} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell align="left">
                                    <img
                                        className={styles.itemImg}
                                        src={row.url}
                                        alt={row.name}
                                    />
                                </TableCell>
                                <TableCell align="left">{row.name}</TableCell>
                                <TableCell align="right">{row.reqQty}</TableCell>
                                <TableCell align="right">{row.grantQty}</TableCell>
                                <TableCell className={styles.widthBuffer} />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};
