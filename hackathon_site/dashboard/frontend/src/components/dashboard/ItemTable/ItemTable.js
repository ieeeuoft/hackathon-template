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

const ColWidth = ({ title }) => {
    switch (title) {
        case "Checked out items":
            return (
                <colgroup>
                    <col className={styles.widthFixed} />
                    <col className={styles.widthHalf} />
                    <col className={styles.widthFixed} />
                    <col className={styles.widthFixed} />
                    <col className={styles.widthBuffer} />
                </colgroup>
            );
        case "Returned items":
            return (
                <colgroup>
                    <col className={styles.widthFixed} />
                    <col className={styles.widthHalf} />
                    <col className={styles.widthFixed} />
                    <col className={styles.widthQuarter} />
                    <col className={styles.widthQuarter} />
                    <col className={styles.widthBuffer} />
                </colgroup>
            );
        case "Order pending":
            return (
                <colgroup>
                    <col className={styles.widthFixed} />
                    <col className={styles.widthHalf} />
                    <col className={styles.widthQuarter} />
                    <col className={styles.widthQuarter} />
                    <col className={styles.widthBuffer} />
                </colgroup>
            );
        default:
            return null;
    }
};

const HeadNames = ({ title }) => {
    switch (title) {
        case "Checked out items":
            return (
                <TableRow>
                    <TableCell />
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="center">Info</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell className={styles.widthBuffer} />
                </TableRow>
            );
        case "Returned items":
            return (
                <TableRow>
                    <TableCell />
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="left">Qty</TableCell>
                    <TableCell align="right">Time</TableCell>
                    <TableCell align="left">Condition</TableCell>
                    <TableCell className={styles.widthBuffer} />
                </TableRow>
            );
        case "Order pending":
            return (
                <TableRow>
                    <TableCell />
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="right">Requested Qty</TableCell>
                    <TableCell align="right">Granted Qty</TableCell>
                    <TableCell className={styles.widthBuffer} />
                </TableRow>
            );
        default:
            return null;
    }
};

const BodyContent = ({ title, items }) => {
    switch (title) {
        case "Checked out items":
            return (
                <TableBody>
                    {items.map((row) => (
                        <TableRow key={row.name}>
                            <TableCell align="left">
                                <img
                                    className={styles.itemImg}
                                    src={row.url}
                                    alt={row.name}
                                />
                            </TableCell>
                            <TableCell align="left">{row.name}</TableCell>
                            <TableCell align="left">
                                <IconButton color="inherit" aria-label="Info">
                                    <Info />
                                </IconButton>
                            </TableCell>
                            <TableCell align="right">{row.qty}</TableCell>
                            <TableCell className={styles.widthBuffer} />
                        </TableRow>
                    ))}
                </TableBody>
            );
        case "Returned items":
            return (
                <TableBody>
                    {items.map((row) => (
                        <TableRow key={row.name}>
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
            );

        case "Order pending":
            return (
                <TableBody>
                    {items.map((row) => (
                        <TableRow key={row.name}>
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
            );
        default:
            return null;
    }
};
const EmptyTable = ({ title }) => {
    switch (title) {
        case "Checked out items":
            return (
                <Paper elevation={3} className={styles.empty} square={true}>
                    You have no items checked out yet. View our inventory.
                </Paper>
            );
        case "Returned items":
            return (
                <Paper elevation={3} className={styles.empty} square={true}>
                    Please bring items to the tech table and a tech team member will
                    assist you.
                </Paper>
            );
        default:
            return null;
    }
};

const ChipStatus = ({ status }) => {
    switch (status) {
        case "ready":
            return (
                <Chip
                    icon={<CheckCircle />}
                    label="Ready for pickup"
                    className={styles.chipGreen}
                />
            );
        case "pending":
            return (
                <Chip
                    icon={<WatchLater />}
                    label="In progress"
                    className={styles.chipOrange}
                />
            );
        case "error":
            return (
                <Chip
                    icon={<Error />}
                    label="Please visit the tech station"
                    className={styles.chipRed}
                />
            );
        default:
            return null;
    }
};

export const ItemTable = ({ items, title, status }) => (
    <Container className={styles.tableContainer} maxWidth={false} disableGutters={true}>
        <div className={styles.title}>
            <Typography variant="h2" className={styles.titleText}>
                {title}
            </Typography>

            {title === "Order pending" ? (
                <ChipStatus status={status} />
            ) : (
                <Button
                    className={styles.titleBtn}
                    onClick={() => {
                        alert("bye bish");
                    }}
                >
                    Hide all
                </Button>
            )}
        </div>

        {!items.length ? (
            <EmptyTable title={title} />
        ) : (
            <TableContainer component={Paper} elevation={3} square={true}>
                <Table className={styles.table} size="small" aria-label="item table">
                    <ColWidth title={title} />
                    <TableHead>
                        <HeadNames title={title} />
                    </TableHead>
                    <BodyContent title={title} items={items} />
                </Table>
            </TableContainer>
        )}
    </Container>
);

export default ItemTable;
