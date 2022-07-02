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
import styles from "components/general/OrderTables/OrderTables.module.scss";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import {
    GeneralOrderTableTitle,
    GeneralOrderTitle,
} from "components/general/OrderTables/OrderTables";
import { Formik, Field } from "formik";

const createDropdownList = (number: number) => {
    let entry = [];

    for (let i = 0; i <= number + 5; i++) {
        entry.push(
            <MenuItem key={i} role="quantity" value={i.toString()}>
                {i}
            </MenuItem>
        );
    }

    return entry;
};

const setInitialValues = (request: { id: number; requested_quantity: number }[]) => {
    let orderInitalValues: Record<string, string | boolean> = {};
    request.forEach((orderItem) => {
        orderInitalValues[`${orderItem.id}-quantity`] =
            orderItem.requested_quantity.toString();
        orderInitalValues[`${orderItem.id}-checkbox`] = false;
    });
    return orderInitalValues;
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

export const TeamPendingOrderTable = () => {
    const orders = mockPendingOrders;
    const hardware = mockHardware;

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            {orders.length > 0 && (
                <GeneralOrderTitle
                    title="Requested Items"
                    isVisible={true}
                    toggleVisibility={() => alert("show/hide orders")}
                />
            )}
            {orders.length &&
                orders.map((pendingOrder) => (
                    <Formik
                        initialValues={setInitialValues(pendingOrder.request)}
                        onSubmit={(values) => alert(values)}
                    >
                        {(props) => (
                            <div key={pendingOrder.id}>
                                <GeneralOrderTableTitle
                                    orderId={pendingOrder.id}
                                    orderStatus={pendingOrder.status}
                                />
                                <TableContainer
                                    component={Paper}
                                    elevation={2}
                                    square={true}
                                >
                                    <Table className={styles.table} size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    className={styles.widthFixed}
                                                />
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
                                                                hardware[row.id]
                                                                    ?.picture ??
                                                                hardwareImagePlaceholder
                                                            }
                                                            alt={hardware[row.id]?.name}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {hardware[row.id]?.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {hardware[row.id]?.model_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {hardware[row.id]?.manufacturer}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.requested_quantity}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "end",
                                                            }}
                                                        >
                                                            <Link
                                                                underline="always"
                                                                color="textPrimary"
                                                                style={{
                                                                    marginRight: "15px",
                                                                }}
                                                            >
                                                                All
                                                            </Link>
                                                            <Select
                                                                value={
                                                                    props.values[
                                                                        `${row.id}-quantity`
                                                                    ]
                                                                }
                                                                onChange={
                                                                    props.handleChange
                                                                }
                                                                label="Qty"
                                                                labelId="qtyLabel"
                                                                name={`${row.id}-quantity`}
                                                                id={`${row.id}-quantity`}
                                                            >
                                                                {createDropdownList(
                                                                    row.requested_quantity
                                                                )}
                                                            </Select>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {convertToDateTime(
                                                            pendingOrder.created_at
                                                        )}
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
                                        <Button
                                            color="secondary"
                                            variant="text"
                                            disableElevation
                                        >
                                            Reject Order
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            color="primary"
                                            variant="contained"
                                            type="submit"
                                            disableElevation
                                            onClick={() => {
                                                alert(
                                                    JSON.stringify(
                                                        props.values,
                                                        undefined,
                                                        2
                                                    )
                                                );
                                            }}
                                        >
                                            Complete Order
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                    </Formik>
                ))}
        </Container>
    );
};

export default TeamPendingOrderTable;
