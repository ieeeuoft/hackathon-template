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
    const orders = useSelector(pendingOrdersSelector);
    let ready_orders = [];
    let submitted_orders = [];
    for (let order of orders) {
        if (order.status === "Ready for Pickup") {
            ready_orders.push(order);
        } else {
            submitted_orders.push(order);
        }
    }
    ready_orders.sort((order1, order2) => {
        return (
            new Date(order1.updatedTime).valueOf() -
            new Date(order2.updatedTime).valueOf()
        );
    });

    submitted_orders.sort((order1, order2) => {
        return (
            new Date(order1.updatedTime).valueOf() -
            new Date(order2.updatedTime).valueOf()
        );
    });

    orders.splice(0, orders.length, ...submitted_orders, ...ready_orders);

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
    const orders = unsorted_orders.slice().sort((order1, order2) => {
        const orderDate1 = order1.hardwareInOrder[0].time;
        const orderDate2 = order2.hardwareInOrder[0].time;

        const matchResult = orderDate1.match(
            /(\d{1,2}):(\d{2}):(\d{2}) (AM|PM) \((\w{3}) (\w{3}) (\d{2}) (\d{4})\)/
        );
        const matchResult2 = orderDate2.match(
            /(\d{1,2}):(\d{2}):(\d{2}) (AM|PM) \((\w{3}) (\w{3}) (\d{2}) (\d{4})\)/
        );

        if (matchResult && matchResult2) {
            // converting invalid date to a valid Date for first order to be compared
            const [, hours, minutes, seconds, meridiem, , month, day, year] =
                matchResult;
            const monthIndex = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ].indexOf(month);

            const date = new Date(
                Number(year),
                monthIndex,
                Number(day),
                Number(hours) + (meridiem === "PM" ? 12 : 0),
                Number(minutes),
                Number(seconds)
            );
            const formattedDate = date.toISOString();

            // converting invalid date to a valid Date for first order to be compared
            const [, hours2, minutes2, seconds2, meridiem2, , month2, day2, year2] =
                matchResult2;
            const monthIndex2 = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ].indexOf(month2);

            const date2 = new Date(
                Number(year2),
                monthIndex2,
                Number(day2),
                Number(hours2) + (meridiem2 === "PM" ? 12 : 0),
                Number(minutes2),
                Number(seconds2)
            );
            const formattedDate2 = date2.toISOString();

            return (
                new Date(formattedDate2).valueOf() - new Date(formattedDate).valueOf()
            );
        } else {
            console.log("Invalid time format");
        }
        return 0;
    });

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
