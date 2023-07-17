import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import styles from "components/general/OrderTables/OrderTables.module.scss";
import { Checkbox, FormGroup, Grid, TableCell, Tooltip } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {
    GeneralOrderTitle,
    GeneralPendingTable,
    GeneralReturnTable,
} from "components/general/OrderTables/OrderTables";
import { Field, FieldProps, Form, Formik, useFormikContext } from "formik";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { OrderInTable, OrderStatus } from "api/types";
import { useDispatch, useSelector } from "react-redux";
import {
    pendingOrdersSelector,
    returnedOrdersSelector,
    UpdateOrderAttributes,
    updateOrderStatus,
} from "slices/order/teamOrderSlice";
import { sortPendingOrders, sortReturnedOrders } from "api/helpers";

interface SimpleOrderFormValues {
    itemIdsChecked: string[];
    checkAll: boolean;
}

const TableCheckbox = ({
    field,
    option,
    order,
    ...props
}: FieldProps & { option: string; order: OrderInTable }) => {
    const { values: formikValues, setFieldValue } =
        useFormikContext<SimpleOrderFormValues>();

    const recheckAllItems = (checked: boolean) => {
        if (order.hardwareInTableRow.length - formikValues.itemIdsChecked.length <= 1) {
            setFieldValue("checkAll", checked);
        }
    };

    return (
        <FormGroup {...field} {...props}>
            <FormControlLabel
                name={field.name}
                value={option}
                control={<Checkbox color="primary" />}
                label=""
                checked={field.value?.includes(option)}
                onChange={(e, checked) => {
                    field.onChange(e);
                    recheckAllItems(checked);
                }}
            />
        </FormGroup>
    );
};

const TableCheckAll = ({
    field,
    order,
    ...props
}: FieldProps & { order: OrderInTable }) => {
    const { setFieldValue } = useFormikContext<SimpleOrderFormValues>();

    const checkAllItems = (checked: boolean) =>
        setFieldValue(
            "itemIdsChecked",
            checked ? order.hardwareInTableRow.map((item) => `hardware-${item.id}`) : []
        );

    return (
        <FormGroup {...field} {...props}>
            <FormControlLabel
                name={field.name}
                value={field.name}
                onChange={(e, checked) => {
                    field.onChange(e);
                    checkAllItems(checked);
                }}
                control={<Checkbox color="primary" />}
                label=""
                checked={field.value}
            />
        </FormGroup>
    );
};

const enableCheckboxColumn = (order: OrderInTable) => ({
    extraColumn: {
        header: (
            <TableCell className={`${styles.widthCheckbox}`}>
                <Field name="checkAll" component={TableCheckAll} order={order} />
            </TableCell>
        ),
        body: (id: number) => (
            <TableCell className={`${styles.widthCheckbox}`}>
                <Field
                    name="itemIdsChecked"
                    component={TableCheckbox}
                    option={`hardware-${id}`}
                    order={order}
                />
            </TableCell>
        ),
    },
});

const CompleteOrderButton = ({ order }: { order: OrderInTable }) => {
    const { values: formikValues } = useFormikContext<SimpleOrderFormValues>();

    const disableCompletion =
        formikValues.itemIdsChecked.length !== order.hardwareInTableRow.length;

    const submitButton = (isDisabled: boolean) => (
        <Button
            color="primary"
            variant="contained"
            disableElevation
            type="submit"
            disabled={isDisabled}
        >
            Complete Order
        </Button>
    );

    return (
        <Grid item>
            {disableCompletion ? (
                <Tooltip
                    title="You must check all items to fulfill the order"
                    placement="top"
                >
                    <span>{submitButton(true)}</span>
                </Tooltip>
            ) : (
                submitButton(false)
            )}
        </Grid>
    );
};

export const SimplePendingOrderFulfillmentTable = () => {
    const dispatch = useDispatch();
    const unsorted_orders = useSelector(pendingOrdersSelector);
    const orders = sortPendingOrders(unsorted_orders);
    const [isVisible, setVisibility] = useState(true);
    const toggleVisibility = () => setVisibility(!isVisible);

    const updateOrder = (orderId: number, status: OrderStatus) => {
        const updateOrderData: UpdateOrderAttributes = {
            id: orderId,
            status: status,
        };
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
                    {...{
                        title: "Simple Fulfillment for Pending Orders",
                        isVisible,
                        toggleVisibility,
                    }}
                />
            )}

            {isVisible &&
                orders.length > 0 &&
                orders.map((pendingOrder) => (
                    <Formik
                        key={pendingOrder.id}
                        initialValues={{
                            itemIdsChecked: [],
                            checkAll: false,
                        }}
                        onSubmit={(values) => {
                            updateOrder(pendingOrder.id, "Ready for Pickup");
                        }}
                    >
                        <Form
                            data-testid={`admin-simple-pending-order-${pendingOrder.id}`}
                            data-updated-time={`pending-order-time-${pendingOrder.updatedTime}`}
                        >
                            <GeneralPendingTable
                                {...{
                                    pendingOrder,
                                    ...(pendingOrder.status === "Submitted" &&
                                        enableCheckboxColumn(pendingOrder)),
                                }}
                            />
                            <Grid
                                container
                                justifyContent="flex-end"
                                spacing={1}
                                style={{ marginTop: "10px" }}
                            >
                                {pendingOrder.status === "Submitted" && (
                                    <Grid item>
                                        <Button
                                            color="secondary"
                                            variant="text"
                                            disableElevation
                                            onClick={() =>
                                                updateOrder(
                                                    pendingOrder.id,
                                                    "Cancelled"
                                                )
                                            }
                                        >
                                            Reject Order
                                        </Button>
                                    </Grid>
                                )}
                                {pendingOrder.status === "Submitted" && (
                                    <CompleteOrderButton order={pendingOrder} />
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
                        </Form>
                    </Formik>
                ))}
        </Container>
    );
};

export const AdminReturnedItemsTable = () => {
    const unsorted_orders = useSelector(returnedOrdersSelector);
    const orders = unsorted_orders.slice().sort(sortReturnedOrders);

    const [isVisible, setVisibility] = useState(true);
    const toggleVisibility = () => setVisibility(!isVisible);

    return (
        <GeneralReturnTable
            {...{
                orders,
                isVisible,
                toggleVisibility,
            }}
        />
    );
};
