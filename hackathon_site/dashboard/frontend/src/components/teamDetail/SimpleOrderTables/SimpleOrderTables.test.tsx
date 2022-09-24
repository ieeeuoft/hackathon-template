import { fireEvent, render, within, act, makeStoreWithEntities } from "testing/utils";
import {
    mockCheckedOutOrdersInTable,
    mockHardware,
    mockPendingOrdersInTable,
    mockReturnedOrdersInTable,
} from "testing/mockData";
import React from "react";
import {
    AdminReturnedItemsTable,
    SimplePendingOrderFulfillmentTable,
} from "./SimpleOrderTables";
import { waitFor } from "@testing-library/react";
import { RootStore } from "slices/store";

const mockOrdersInTable = mockPendingOrdersInTable.concat(mockCheckedOutOrdersInTable);

describe("<SimplePendingOrderFulfillmentTable />", () => {
    let store: RootStore;

    beforeEach(() => {
        store = makeStoreWithEntities({
            hardware: mockHardware,
            teamDetailOrders: mockOrdersInTable,
        });
    });

    it("Shows tables by default and toggles visibility when button is clicked", async () => {
        const { getByText, queryByText } = render(
            <SimplePendingOrderFulfillmentTable />,
            { store }
        );
        const button = getByText(/hide all/i);

        mockPendingOrdersInTable.forEach(({ id, status }) => {
            if (status !== "Cancelled")
                expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrdersInTable.forEach(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });

    it("Shows complete order button for Submitted Orders, shows picked up button and removes reject order button for Ready to Pickup orders", () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />, {
            store,
        });

        mockPendingOrdersInTable.forEach(({ id, status }) => {
            if (status !== "Cancelled") {
                const { getByText, queryByText } = within(
                    getByTestId(`admin-simple-pending-order-${id}`)
                );
                expect(getByText(`Order #${id}`)).toBeInTheDocument();
                if (status === "Ready for Pickup") {
                    expect(queryByText(/reject order/i)).not.toBeInTheDocument();
                } else {
                    expect(getByText(/reject order/i)).toBeInTheDocument();
                }
                if (status === "Submitted") {
                    expect(getByText(/complete order/i)).toBeInTheDocument();
                    expect(queryByText(/picked up/i)).not.toBeInTheDocument();
                } else {
                    expect(queryByText(/complete order/i)).not.toBeInTheDocument();
                    expect(getByText(/picked up/i)).toBeInTheDocument();
                }
            }
        });
    });

    it("Does not show checkboxes for Ready to Pickup orders", () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />, {
            store,
        });

        mockPendingOrdersInTable.forEach((order) => {
            const { queryByDisplayValue, getByDisplayValue } = within(
                getByTestId(`admin-simple-pending-order-${order.id}`)
            );
            if (order.status == "Submitted") {
                order.hardwareInTableRow.forEach(({ id }) => {
                    expect(getByDisplayValue(`hardware-${id}`)).toBeInTheDocument();
                });
                expect(getByDisplayValue("checkAll")).toBeInTheDocument();
            } else {
                order.hardwareInTableRow.forEach(({ id }) => {
                    expect(
                        queryByDisplayValue(`hardware-${id}`)
                    ).not.toBeInTheDocument();
                });
                expect(queryByDisplayValue("checkAll")).not.toBeInTheDocument();
            }
        });
    });

    it("Disables complete order button when items are unchecked", () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />, {
            store,
        });

        mockPendingOrdersInTable
            .filter(({ status }) => status === "Submitted")
            .map(({ id }) => {
                const { getByText } = within(
                    getByTestId(`admin-simple-pending-order-${id}`)
                );
                expect(getByText(/complete order/i).parentNode).toBeDisabled();
            });
    });

    it("Enables complete order button when items are all checked", async () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />, {
            store,
        });

        const order = mockPendingOrdersInTable.find(
            ({ status }) => status === "Submitted"
        );

        if (order) {
            const { getByText, getByDisplayValue } = within(
                getByTestId(`admin-simple-pending-order-${order.id}`)
            );
            expect(getByText(/complete order/i).parentNode).toBeDisabled();
            await act(async () => {
                for (const { id } of order.hardwareInTableRow) {
                    const checkbox = getByDisplayValue(`hardware-${id}`);
                    expect(checkbox).not.toBeChecked();
                    if (checkbox) fireEvent.click(checkbox);
                    await waitFor(() => {
                        expect(checkbox).toBeChecked();
                    });
                }
            });
            await waitFor(() => {
                expect(getByDisplayValue("checkAll")).toBeChecked();
                expect(getByText(/complete order/i).closest("button")).toBeEnabled();
            });
        }
    });

    test("Check All checkbox is unchecked when some/all rows are unchecked", async () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />, {
            store,
        });

        const order = mockPendingOrdersInTable.find(
            ({ status }) => status === "Submitted"
        );

        if (order) {
            const { getByDisplayValue } = within(
                getByTestId(`admin-simple-pending-order-${order.id}`)
            );
            const checkAllCheckbox = getByDisplayValue("checkAll");
            expect(checkAllCheckbox).not.toBeChecked();
            await act(async () => {
                fireEvent.click(checkAllCheckbox);
                await waitFor(() => {
                    order.hardwareInTableRow.forEach(({ id }) => {
                        expect(getByDisplayValue(`hardware-${id}`)).toBeChecked();
                    });
                });
                fireEvent.click(
                    getByDisplayValue(`hardware-${order.hardwareInTableRow[0].id}`)
                );
                await waitFor(() => {
                    expect(checkAllCheckbox).not.toBeChecked();
                });
            });
        }
    });
});

describe("<AdminReturnedItemsTable />", () => {
    let store: RootStore;

    beforeEach(() => {
        store = makeStoreWithEntities({
            hardware: mockHardware,
            teamDetailOrderState: {
                returnedOrders: mockReturnedOrdersInTable,
            },
        });
    });

    it("Shows tables by default and toggles visibility when button is clicked", async () => {
        const { getByText, queryByText } = render(<AdminReturnedItemsTable />, {
            store,
        });
        const button = getByText(/hide all/i);

        mockReturnedOrdersInTable.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockReturnedOrdersInTable.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });
});
