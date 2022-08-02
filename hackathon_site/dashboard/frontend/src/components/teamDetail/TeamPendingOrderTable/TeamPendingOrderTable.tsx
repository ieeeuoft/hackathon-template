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
import { mockHardware, mockPendingOrdersInTable } from "testing/mockData";
import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import styles from "components/general/OrderTables/OrderTables.module.scss";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import {
    GeneralOrderTableTitle,
    GeneralOrderTitle,
} from "components/general/OrderTables/OrderTables";
import { Formik } from "formik";

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

const setInitialValues = (
    request: { id: number; quantityRequested: number; quantityGranted: number }[]
) => {
    let orderInitialValues: Record<string, string | boolean> = {};
    request.forEach((orderItem) => {
        orderInitialValues[`${orderItem.id}-quantity`] =
            orderItem.quantityGranted.toString();
        orderInitialValues[`${orderItem.id}-checkbox`] = false;
    });
    return orderInitialValues;
};

export const TeamPendingOrderTable = () => {
    const orders = mockPendingOrdersInTable;
    const hardware = mockHardware;
    const [visibility, setVisibility] = useState(true);
    const toggleVisibility = () => {
        setVisibility(!visibility);
    };

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            {orders.length > 0 && (
                <GeneralOrderTitle
                    title="Requested Items"
                    isVisible={visibility}
                    toggleVisibility={toggleVisibility}
                />
            )}
            {visibility &&
                orders.length &&
                orders.map((pendingOrder) => (
                    <Formik
                        initialValues={setInitialValues(
                            pendingOrder.hardwareInTableRow
                        )}
                        onSubmit={(values) =>
                            alert(JSON.stringify(values, undefined, 2))
                        }
                    >
                        {(props) => (
                            <form onSubmit={props.handleSubmit}>
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
                                                    <TableCell
                                                        className={styles.width6}
                                                    >
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
                                                        <Checkbox
                                                            color="primary"
                                                            data-testid={`checkall-${pendingOrder.id}`}
                                                            onChange={(e) => {
                                                                pendingOrder.hardwareInTableRow.forEach(
                                                                    (row) => {
                                                                        props.setFieldValue(
                                                                            `${row.id}-checkbox`,
                                                                            e.target
                                                                                .checked
                                                                        );
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pendingOrder.hardwareInTableRow.map(
                                                    (row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            data-testid={`table-${pendingOrder.id}-${row.id}`}
                                                        >
                                                            <TableCell>
                                                                <img
                                                                    className={
                                                                        styles.itemImg
                                                                    }
                                                                    src={
                                                                        hardware[
                                                                            row.id - 1
                                                                        ]?.picture ??
                                                                        hardwareImagePlaceholder
                                                                    }
                                                                    alt={
                                                                        hardware[
                                                                            row.id - 1
                                                                        ]?.name
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    hardware[row.id - 1]
                                                                        ?.name
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    hardware[row.id - 1]
                                                                        ?.model_number
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    hardware[row.id - 1]
                                                                        ?.manufacturer
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {row.quantityRequested}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems:
                                                                            "end",
                                                                    }}
                                                                >
                                                                    <Link
                                                                        underline="always"
                                                                        color="textPrimary"
                                                                        style={{
                                                                            marginRight:
                                                                                "15px",
                                                                        }}
                                                                        data-testid={`all-button`}
                                                                        onClick={() => {
                                                                            props.setFieldValue(
                                                                                `${row.id}-quantity`,
                                                                                row.quantityGranted
                                                                            );
                                                                        }}
                                                                    >
                                                                        All
                                                                    </Link>
                                                                    <Select
                                                                        value={
                                                                            props
                                                                                .values[
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
                                                                        data-testid={`select`}
                                                                    >
                                                                        {createDropdownList(
                                                                            row.quantityGranted
                                                                        )}
                                                                    </Select>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Checkbox
                                                                    color="primary"
                                                                    checked={
                                                                        props.values[
                                                                            `${row.id}-checkbox`
                                                                        ] === true
                                                                    }
                                                                    name={`${row.id}-checkbox`}
                                                                    onChange={
                                                                        props.handleChange
                                                                    }
                                                                    data-testid={`${row.id}-checkbox`}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
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
                                                data-testid={`complete-button-${pendingOrder.id}`}
                                            >
                                                Complete Order
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </div>
                            </form>
                        )}
                    </Formik>
                ))}
        </Container>
    );
};

export default TeamPendingOrderTable;
