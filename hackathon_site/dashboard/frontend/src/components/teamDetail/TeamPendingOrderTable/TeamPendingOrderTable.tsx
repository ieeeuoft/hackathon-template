import {
    Button,
    Checkbox,
    Grid,
    Link,
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
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import { ChipStatus } from "components/dashboard/ItemTable/ItemTable";

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
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            {orders.length > 0 && (
                <div className={styles.title}>
                    <Typography variant="h2" className={styles.titleText}>
                        Requested Items
                    </Typography>
                    <Button onClick={() => alert("show/hide tables")} color="primary">
                        Hide all
                    </Button>
                </div>
            )}
            {orders.map((pendingOrder) => (
                <div key={pendingOrder.id}>
                    <Container
                        className={styles.titleChip}
                        maxWidth={false}
                        disableGutters={true}
                    >
                        <Typography variant="h2" className={styles.titleChipText}>
                            {`Order #${pendingOrder.id}`}
                        </Typography>
                        <Container
                            className={styles.titleChipSpace}
                            maxWidth={false}
                            disableGutters={true}
                        >
                            <ChipStatus status={pendingOrder.status} />
                        </Container>
                    </Container>
                    <TableContainer component={Paper} elevation={2} square={true}>
                        <Table className={styles.table} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell className={styles.widthFixed} />
                                    <TableCell className={styles.width6}>
                                        Name
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                    >
                                        Model
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                    >
                                        Manufacturer
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                    >
                                        Qty requested
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width6} ${styles.noWrap}`}
                                    >
                                        Qty granted
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.width1} ${styles.noWrap}`}
                                    >
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
                                        <TableCell>{hardware[row.id]?.name}</TableCell>
                                        <TableCell>
                                            {hardware[row.id]?.model_number}
                                        </TableCell>
                                        <TableCell>
                                            {hardware[row.id]?.manufacturer}
                                        </TableCell>
                                        <TableCell>{row.requested_quantity}</TableCell>
                                        <TableCell>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-evenly",
                                                    alignItems: "end",
                                                }}
                                            >
                                                <Link
                                                    underline="always"
                                                    color="textPrimary"
                                                >
                                                    {" "}
                                                    All{" "}
                                                </Link>
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
                                            </div>
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
                    </TableContainer>
                    <Grid
                        container
                        justifyContent="flex-end"
                        spacing={1}
                        style={{ marginTop: "10px" }}
                    >
                        <Grid item>
                            <Button color="secondary" variant="text" disableElevation>
                                Reject Order
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                color="primary"
                                variant="contained"
                                disableElevation
                            >
                                Complete Order
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            ))}
        </Container>
    );
};

export default TeamPendingOrderTable;
