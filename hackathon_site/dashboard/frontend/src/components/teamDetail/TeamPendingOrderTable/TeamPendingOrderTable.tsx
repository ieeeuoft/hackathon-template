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
import { mockPendingOrders, mockHardware } from "testing/mockData";
import React from "react";
import Container from "@material-ui/core/Container";
import styles from "components/dashboard/ItemTable/ItemTable.module.scss";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";

const createDropdownList = (number: number) => {
    let entry = [];

    for (let i = 0; i <= number; i++) {
        entry.push(
            <MenuItem key={i} role="quantity" value={i.toString()}>
                {i}
            </MenuItem>
        );
    }

    return entry;
};

const convertToDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDateString =
        ("0" + date.getUTCHours()).slice(-2) +
        ":" +
        ("0" + date.getUTCMinutes()).slice(-2) +
        ":" +
        ("0" + date.getUTCSeconds()).slice(-2) +
        " " +
        ("0" + date.getUTCDate()).slice(-2) +
        "/" +
        ("0" + (date.getUTCMonth() + 1)).slice(-2) +
        "/" +
        date.getUTCFullYear();
    return formattedDateString;
};

export const grantQtyForm = (requestedQuantity: number) => {
    return (
        <Grid container direction="column">
            <FormControl variant="standard" hiddenLabel={true}>
                <Select value={0} label="Qty" labelId="qtyLabel" name="quantity">
                    {createDropdownList(requestedQuantity)}
                </Select>
            </FormControl>

            <Typography variant={"h2"}>test</Typography>
        </Grid>
    );
};

export const TeamPendingOrderTable = () => {
    const orders = mockPendingOrders;
    const hardware = mockHardware;

    const testfunc = () => {};

    return (
        <Container maxWidth={false} disableGutters={true}>
            {orders.map((pendingOrder) => (
                <Grid container direction="column" spacing={1} item md={6} xs={12}>
                    <Grid item>
                        <Typography variant="h2">{`Order #${pendingOrder.id}`}</Typography>
                    </Grid>
                    <Grid item>
                        <Table className={styles.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={styles.width1} />
                                    <TableCell className={styles.width2}>
                                        Name
                                    </TableCell>
                                    <TableCell className={`${styles.width1}`}>
                                        Model
                                    </TableCell>
                                    <TableCell className={`${styles.width1}`}>
                                        Manufacturer
                                    </TableCell>
                                    <TableCell className={`${styles.width1}`}>
                                        Qty requested
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                    >
                                        Qty granted
                                    </TableCell>
                                    <TableCell className={`${styles.width1}`}>
                                        Time
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            color="primary"
                                            style={{
                                                marginLeft: "-15px",
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingOrder.request.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <img
                                                className={styles.itemImg}
                                                src={
                                                    hardware[row.id]?.picture ??
                                                    hardwareImagePlaceholder
                                                }
                                                alt={hardware[row.id]?.name}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {`${hardware[row.id]?.name}`}
                                        </TableCell>
                                        <TableCell>
                                            {`${hardware[row.id]?.model_number}`}
                                        </TableCell>
                                        <TableCell>
                                            {`${hardware[row.id]?.manufacturer}`}
                                        </TableCell>
                                        <TableCell>
                                            {`${row.requested_quantity}`}
                                        </TableCell>
                                        <TableCell
                                            style={{
                                                display: "inline-block",
                                                verticalAlign: "baseline",
                                            }}
                                            className={`${styles.width2} ${styles.noWrap}`}
                                        >
                                            All
                                            <FormControl
                                                variant="standard"
                                                hiddenLabel={true}
                                            >
                                                <Select
                                                    value={0}
                                                    label="Qty"
                                                    labelId="qtyLabel"
                                                    name="quantity"
                                                >
                                                    {createDropdownList(
                                                        row.requested_quantity
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            {convertToDateTime(pendingOrder.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
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
                    </Grid>
                    <Grid container justifyContent="flex-end">
                        <Button color="secondary" variant="text" disableElevation>
                            Reject Order
                        </Button>
                        <Button color="primary" variant="contained" disableElevation>
                            Complete Order
                        </Button>
                    </Grid>
                </Grid>
            ))}
        </Container>
    );
};

export default TeamPendingOrderTable;
