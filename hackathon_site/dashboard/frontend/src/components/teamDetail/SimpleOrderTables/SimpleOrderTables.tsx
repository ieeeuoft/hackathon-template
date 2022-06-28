import { mockPendingOrdersInTable, mockReturnedOrdersInTable } from "testing/mockData";
import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import styles from "components/general/OrderTables/OrderTables.module.scss";
import { Grid } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {
    GeneralOrderTitle,
    GeneralPendingTable,
    GeneralReturnTable,
} from "components/general/OrderTables/OrderTables";

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
                    <div
                        key={pendingOrder.id}
                        data-testid={`admin-pending-order-${pendingOrder.id}`}
                    >
                        <GeneralPendingTable {...{ pendingOrder }} />
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
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        disableElevation
                                    >
                                        Complete Order
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </div>
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
