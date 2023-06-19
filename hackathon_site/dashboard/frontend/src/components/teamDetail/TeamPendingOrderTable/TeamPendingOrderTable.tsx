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
    Tooltip,
    Typography,
} from "@material-ui/core";
import { OrderStatus } from "api/types";
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
import { Formik, FormikValues } from "formik";
import { useDispatch, useSelector } from "react-redux";
import {
    isLoadingSelector,
    pendingOrdersSelector,
    UpdateOrderAttributes,
    updateOrderStatus,
} from "slices/order/teamOrderSlice";
import { hardwareSelectors } from "slices/hardware/hardwareSlice";

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
    const dispatch = useDispatch();
    const orders = useSelector(pendingOrdersSelector);
    const hardware = useSelector(hardwareSelectors.selectEntities);
    const isLoading = useSelector(isLoadingSelector);
    const [visibility, setVisibility] = useState(true);
    const toggleVisibility = () => {
        setVisibility(!visibility);
    };

    const updateOrder = (
        orderId: number,
        status: OrderStatus,
        values: FormikValues | null = null
    ) => {
        const updateOrderData: UpdateOrderAttributes = {
            id: orderId,
            status,
            request: [],
        };
        if (values) {
            const request = [];
            const formikKeys = Object.keys(values);
            for (let i = 0; i < formikKeys.length; i += 2) {
                const hardwareId = parseInt(formikKeys[i].split("-")[0]);
                request.push({
                    id: hardwareId,
                    requested_quantity: values[formikKeys[i + 1]]
                        ? parseInt(values[formikKeys[i]])
                        : 0,
                });
            }
            updateOrderData.request = request;
        }
        dispatch(updateOrderStatus(updateOrderData));
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
                orders.length > 0 &&
                orders.map((pendingOrder) => (
                    <Formik
                        initialValues={setInitialValues(
                            pendingOrder.hardwareInTableRow
                        )}
                        onSubmit={(values) =>
                            updateOrder(pendingOrder.id, "Ready for Pickup", values)
                        }
                        key={pendingOrder.id}
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
                                                        className={`${styles.width1} ${styles.noWrap}`}
                                                    >
                                                        Qty granted by system
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${styles.width6} ${styles.noWrap}`}
                                                    >
                                                        Qty granted
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${styles.width1} ${styles.noWrap}`}
                                                    >
                                                        {pendingOrder.status ===
                                                            "Submitted" && (
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
                                                        )}
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
                                                                        hardware[row.id]
                                                                            ?.picture ??
                                                                        hardware[row.id]
                                                                            ?.image_url ??
                                                                        hardwareImagePlaceholder
                                                                    }
                                                                    alt={
                                                                        hardware[row.id]
                                                                            ?.name
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {hardware[row.id]?.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    hardware[row.id]
                                                                        ?.model_number
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    hardware[row.id]
                                                                        ?.manufacturer
                                                                }
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign: "right",
                                                                }}
                                                            >
                                                                {row.quantityRequested}
                                                            </TableCell>
                                                            <TableCell
                                                                style={{
                                                                    textAlign: "right",
                                                                }}
                                                            >
                                                                {
                                                                    row.quantityGrantedBySystem
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {pendingOrder.status ===
                                                                    "Submitted" && (
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
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
                                                                                    row.quantityGrantedBySystem
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
                                                                                row.quantityGrantedBySystem
                                                                            )}
                                                                        </Select>
                                                                    </div>
                                                                )}
                                                                {pendingOrder.status ===
                                                                    "Ready for Pickup" && (
                                                                    <p
                                                                        style={{
                                                                            textAlign:
                                                                                "center",
                                                                            ...(row.quantityGranted <
                                                                                row.quantityGrantedBySystem && {
                                                                                fontWeight:
                                                                                    "bold",
                                                                                backgroundColor:
                                                                                    "#c1edc1",
                                                                            }),
                                                                        }}
                                                                    >
                                                                        {
                                                                            row.quantityGranted
                                                                        }
                                                                    </p>
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {pendingOrder.status ===
                                                                    "Submitted" && (
                                                                    <Checkbox
                                                                        color="primary"
                                                                        checked={
                                                                            props
                                                                                .values[
                                                                                `${row.id}-checkbox`
                                                                            ] === true
                                                                        }
                                                                        name={`${row.id}-checkbox`}
                                                                        onChange={
                                                                            props.handleChange
                                                                        }
                                                                        data-testid={`${row.id}-checkbox`}
                                                                    />
                                                                )}
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
                                        <Grid item style={{ marginTop: "5px" }}>
                                            <Typography variant="body2">
                                                Note: participants will receive an email
                                                every time you change the status of
                                                their order.
                                            </Typography>
                                        </Grid>
                                        {pendingOrder.status === "Submitted" && (
                                            <Grid item>
                                                <Button
                                                    onClick={() =>
                                                        updateOrder(
                                                            pendingOrder.id,
                                                            "Cancelled"
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    color="secondary"
                                                    variant="text"
                                                    disableElevation
                                                >
                                                    Reject Order
                                                </Button>
                                            </Grid>
                                        )}
                                        {pendingOrder.status === "Ready for Pickup" && (
                                            <Grid item>
                                                <Button
                                                    onClick={() =>
                                                        updateOrder(
                                                            pendingOrder.id,
                                                            "Submitted"
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    color="secondary"
                                                    variant="text"
                                                    disableElevation
                                                >
                                                    Edit Order
                                                </Button>
                                            </Grid>
                                        )}
                                        {pendingOrder.status === "Submitted" && (
                                            <Grid item>
                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    type="submit"
                                                    disableElevation
                                                    data-testid={`complete-button-${pendingOrder.id}`}
                                                    disabled={
                                                        isLoading ||
                                                        Object.keys(
                                                            props.values
                                                        ).findIndex(
                                                            (key) =>
                                                                key.includes(
                                                                    "checkbox"
                                                                ) && props.values[key]
                                                        ) === -1
                                                    }
                                                >
                                                    Complete Order
                                                </Button>
                                            </Grid>
                                        )}
                                        {pendingOrder.status === "Ready for Pickup" && (
                                            <Grid item>
                                                <Tooltip
                                                    title="Ensure that you've collected a piece of ID before the team picks up the order"
                                                    placement="top"
                                                >
                                                    <span>
                                                        <Button
                                                            color="secondary"
                                                            variant="contained"
                                                            disableElevation
                                                            onClick={() =>
                                                                updateOrder(
                                                                    pendingOrder.id,
                                                                    "Picked Up"
                                                                )
                                                            }
                                                        >
                                                            Picked Up
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            </Grid>
                                        )}
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
