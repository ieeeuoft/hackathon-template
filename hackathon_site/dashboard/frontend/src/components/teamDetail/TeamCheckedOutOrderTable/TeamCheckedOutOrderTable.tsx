import {
    Button,
    Checkbox,
    Grid,
    IconButton,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
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
import Info from "@material-ui/icons/Info";
import { useDispatch, useSelector } from "react-redux";
import {
    checkedOutOrdersSelector,
    errorSelector,
    isReturnedLoadingSelector,
    returnItems,
    updateOrderStatus,
    UpdateOrderAttributes,
} from "slices/order/teamOrderSlice";
import {
    getUpdatedHardwareDetails,
    hardwareSelectors,
} from "slices/hardware/hardwareSlice";
import { displaySnackbar, openProductOverview } from "slices/ui/uiSlice";
import { sortCheckedOutOrders } from "api/helpers";

const createDropdownList = (number: number) => {
    let entry = [];

    for (let i = 1; i <= number; i++) {
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
        orderInitialValues[`${orderItem.id}-condition`] = "Healthy";
    });
    return orderInitialValues;
};

export const TeamCheckedOutOrderTable = () => {
    const unsorted_orders = useSelector(checkedOutOrdersSelector);
    const orders = unsorted_orders.slice().sort(sortCheckedOutOrders);
    const fetchOrdersError = useSelector(errorSelector);
    const returnIsLoading = useSelector(isReturnedLoadingSelector);
    const hardware = useSelector(hardwareSelectors.selectEntities);
    const [visibility, setVisibility] = useState(true);
    const toggleVisibility = () => {
        setVisibility(!visibility);
    };
    const dispatch = useDispatch();
    const openProductOverviewPanel = (hardwareId: number) => {
        dispatch(getUpdatedHardwareDetails(hardwareId));
        dispatch(openProductOverview());
    };

    const handleReturnOrder = (values: FormikValues, orderId: number) => {
        try {
            // convert formik to correct format here
            const hardware = [];
            const keys = Object.keys(values);
            for (let i = 0; i < keys.length; i += 3) {
                const id = parseInt(keys[i].split("-")[0]);
                if (values[keys[i + 1]]) {
                    hardware.push({
                        id,
                        quantity: values[keys[i]],
                        part_returned_health: values[keys[i + 2]],
                    });
                }
            }
            dispatch(returnItems({ hardware, order: orderId }));
            // If all order items have been returned, update order status to 'Returned'
            if (hardware.length === keys.length / 3) {
                const updateOrderData: UpdateOrderAttributes = {
                    id: orderId,
                    status: "Returned",
                };
                dispatch(updateOrderStatus(updateOrderData));
            }
        } catch (e) {
            dispatch(
                displaySnackbar({
                    message: "There was an error parsing orders.",
                    options: {
                        variant: "error",
                    },
                })
            );
        }
    };

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            <GeneralOrderTitle
                title="Checked Out Items"
                isVisible={visibility}
                toggleVisibility={toggleVisibility}
            />
            {visibility &&
                (!orders.length || fetchOrdersError ? (
                    <Paper elevation={2} className={styles.empty} square={true}>
                        {fetchOrdersError
                            ? `Unable to view checked out items.`
                            : "You have no items checked out yet. View our inventory."}
                    </Paper>
                ) : (
                    orders.map((checkedOutOrder) => (
                        <Formik
                            initialValues={setInitialValues(
                                checkedOutOrder.hardwareInTableRow
                            )}
                            onSubmit={(values) => {
                                handleReturnOrder(values, checkedOutOrder.id);
                            }}
                            key={checkedOutOrder.id}
                        >
                            {(props) => (
                                <form onSubmit={props.handleSubmit}>
                                    <div key={checkedOutOrder.id}>
                                        <GeneralOrderTableTitle
                                            orderId={checkedOutOrder.id}
                                            orderStatus={checkedOutOrder.status}
                                            createdTime={checkedOutOrder.createdTime}
                                            updatedTime={checkedOutOrder.updatedTime}
                                        />
                                        <TableContainer
                                            component={Paper}
                                            elevation={2}
                                            square={true}
                                        >
                                            <Table
                                                className={styles.table}
                                                size="small"
                                            >
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell
                                                            className={
                                                                styles.widthFixed
                                                            }
                                                        />
                                                        <TableCell
                                                            className={styles.width6}
                                                        >
                                                            Name
                                                        </TableCell>
                                                        <TableCell
                                                            className={`${styles.width1} ${styles.noWrap}`}
                                                        >
                                                            Info
                                                        </TableCell>
                                                        {/*<TableCell*/}
                                                        {/*    className={`${styles.width1} ${styles.noWrap}`}*/}
                                                        {/*>*/}
                                                        {/*    Qty*/}
                                                        {/*</TableCell>*/}
                                                        <TableCell
                                                            className={`${styles.width1} ${styles.noWrap}`}
                                                        >
                                                            Qty to return
                                                        </TableCell>
                                                        <TableCell
                                                            className={`${styles.width6} ${styles.noWrap}`}
                                                            align={"right"}
                                                        >
                                                            Qty remaining
                                                        </TableCell>
                                                        <TableCell
                                                            className={`${styles.width1} ${styles.noWrap}`}
                                                        >
                                                            Condition
                                                        </TableCell>
                                                        <TableCell
                                                            className={`${styles.width1} ${styles.noWrap}`}
                                                        >
                                                            <Checkbox
                                                                color="primary"
                                                                data-testid={`checkall-${checkedOutOrder.id}`}
                                                                onChange={(e) => {
                                                                    checkedOutOrder.hardwareInTableRow.forEach(
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
                                                    {checkedOutOrder.hardwareInTableRow.map(
                                                        (row) => (
                                                            <TableRow
                                                                key={row.id}
                                                                data-testid={`table-${checkedOutOrder.id}-${row.id}`}
                                                            >
                                                                <TableCell>
                                                                    <img
                                                                        className={
                                                                            styles.itemImg
                                                                        }
                                                                        src={
                                                                            hardware[
                                                                                row.id
                                                                            ]
                                                                                ?.picture ??
                                                                            hardware[
                                                                                row.id
                                                                            ]
                                                                                ?.image_url ??
                                                                            hardwareImagePlaceholder
                                                                        }
                                                                        alt={
                                                                            hardware[
                                                                                row.id
                                                                            ]?.name
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        hardware[row.id]
                                                                            ?.name
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <IconButton
                                                                        color="inherit"
                                                                        aria-label="Info"
                                                                        data-testid="info-button"
                                                                        onClick={() =>
                                                                            openProductOverviewPanel(
                                                                                row.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Info />
                                                                    </IconButton>
                                                                </TableCell>
                                                                {/* TODO: Add total quantity column */}
                                                                {/*<TableCell>*/}
                                                                {/*    {*/}
                                                                {/*        hardware[row.id]*/}
                                                                {/*            ?.quantity_available*/}
                                                                {/*    }*/}
                                                                {/*</TableCell>*/}
                                                                <TableCell>
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
                                                                <TableCell
                                                                    align={"right"}
                                                                >
                                                                    {
                                                                        row.quantityGranted
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        value={
                                                                            props
                                                                                .values[
                                                                                `${row.id}-condition`
                                                                            ]
                                                                        }
                                                                        onChange={
                                                                            props.handleChange
                                                                        }
                                                                        label="Condition"
                                                                        labelId="conditionLabel"
                                                                        name={`${row.id}-condition`}
                                                                        id={`${row.id}-condition`}
                                                                        defaultValue={
                                                                            "Healthy"
                                                                        }
                                                                    >
                                                                        <MenuItem value="Healthy">
                                                                            Healthy
                                                                        </MenuItem>
                                                                        <MenuItem value="Heavily Used">
                                                                            Heavily Used
                                                                        </MenuItem>
                                                                        <MenuItem value="Broken">
                                                                            Broken
                                                                        </MenuItem>
                                                                        <MenuItem value="Lost">
                                                                            Lost
                                                                        </MenuItem>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell align="center">
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
                                                    color="primary"
                                                    variant="contained"
                                                    type="submit"
                                                    disableElevation
                                                    disabled={
                                                        returnIsLoading ||
                                                        Object.keys(props.values).find(
                                                            (key) =>
                                                                key.includes(
                                                                    "checkbox"
                                                                ) &&
                                                                props.values[key] ===
                                                                    true
                                                        ) === undefined
                                                    }
                                                    data-testid={`return-button-${checkedOutOrder.id}`}
                                                >
                                                    Return Items
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    ))
                ))}
        </Container>
    );
};

export default TeamCheckedOutOrderTable;
