import { mockPendingOrdersInTable, mockReturnedOrdersInTable } from "testing/mockData";
import React, { ChangeEvent, ChangeEventHandler, useState } from "react";
import Container from "@material-ui/core/Container";
import styles from "components/general/OrderTables/OrderTables.module.scss";
import { Checkbox, FormGroup, Grid, TableCell, Tooltip } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {
    GeneralOrderTitle,
    GeneralPendingTable,
    GeneralReturnTable,
} from "components/general/OrderTables/OrderTables";
import { Field, FieldProps, Form, Formik } from "formik";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const TableCheckbox = ({
    field,
    option,
    recheckAll,
    ...props
}: FieldProps & { option: string; recheckAll: (e: ChangeEvent<{}>) => void }) => (
    <FormGroup {...field} {...props}>
        <FormControlLabel
            name={field.name}
            value={option}
            control={<Checkbox color="primary" />}
            label=""
            checked={field.value?.includes(option)}
            onChange={(e) => {
                field.onChange(e);
                recheckAll(e);
            }}
        />
    </FormGroup>
);

const TableCheckAll = ({
    field,
    checkAll,
    ...props
}: FieldProps & { checkAll: (e: ChangeEvent<{}>) => void }) => (
    <FormGroup {...field} {...props}>
        <FormControlLabel
            name={field.name}
            value={field.value}
            onChange={checkAll}
            control={<Checkbox color="primary" />}
            label=""
            checked={field.value}
        />
    </FormGroup>
);

const CompleteOrderButton = ({ isDisabled }: { isDisabled: boolean }) => (
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

export const SimplePendingOrderFulfillmentTable = () => {
    const orders = mockPendingOrdersInTable;

    const [isVisible, setVisibility] = useState(true);
    const toggleVisibility = () => setVisibility(!isVisible);

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
                        onSubmit={(values) => console.log(values)}
                    >
                        {({ values, setFieldValue }) => {
                            const disableCompletion =
                                values.itemIdsChecked.length !==
                                pendingOrder.hardwareInTableRow.length;
                            const checkAllItems = (e: ChangeEvent<HTMLInputElement>) =>
                                setFieldValue(
                                    "itemIdsChecked",
                                    e.target.checked
                                        ? pendingOrder.hardwareInTableRow.map(
                                              (item) => `hardware-${item.id}`
                                          )
                                        : []
                                );
                            const recheckAllItems = (
                                e: ChangeEvent<HTMLInputElement>
                            ) => {
                                if (
                                    pendingOrder.hardwareInTableRow.length -
                                        values.itemIdsChecked.length <=
                                    1
                                ) {
                                    setFieldValue("checkAll", e.target.checked);
                                }
                            };
                            return (
                                <Form
                                    data-testid={`admin-pending-order-${pendingOrder.id}`}
                                >
                                    <GeneralPendingTable
                                        {...{
                                            pendingOrder,
                                            ...(pendingOrder.status === "Submitted" && {
                                                extraColumn: {
                                                    header: (
                                                        <TableCell
                                                            className={`${styles.width1} ${styles.noWrap}`}
                                                            align="center"
                                                        >
                                                            <Field
                                                                name="checkAll"
                                                                component={
                                                                    TableCheckAll
                                                                }
                                                                checkAll={checkAllItems}
                                                            />
                                                        </TableCell>
                                                    ),
                                                    body: (id) => (
                                                        <TableCell
                                                            className={`${styles.width1} ${styles.noWrap}`}
                                                            align="center"
                                                        >
                                                            <Field
                                                                name="itemIdsChecked"
                                                                component={
                                                                    TableCheckbox
                                                                }
                                                                option={`hardware-${id}`}
                                                                recheckAll={
                                                                    recheckAllItems
                                                                }
                                                            />
                                                        </TableCell>
                                                    ),
                                                },
                                            }),
                                        }}
                                    />
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
                                        {pendingOrder.status === "Submitted" && (
                                            <Grid item>
                                                {disableCompletion ? (
                                                    <Tooltip
                                                        title="You must check all items to fulfill the order"
                                                        placement="top"
                                                    >
                                                        <span>
                                                            <CompleteOrderButton
                                                                isDisabled={true}
                                                            />
                                                        </span>
                                                    </Tooltip>
                                                ) : (
                                                    <CompleteOrderButton
                                                        isDisabled={false}
                                                    />
                                                )}
                                            </Grid>
                                        )}
                                    </Grid>
                                </Form>
                            );
                        }}
                    </Formik>
                ))}
        </Container>
    );
};

export const AdminReturnedItemsTable = () => {
    const orders = mockReturnedOrdersInTable;

    return (
        <GeneralReturnTable
            {...{
                orders,
                isVisible: true,
            }}
        />
    );
};
