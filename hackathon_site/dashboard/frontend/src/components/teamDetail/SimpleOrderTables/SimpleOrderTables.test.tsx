import { fireEvent, render, within, act } from "testing/utils";
import { mockPendingOrdersInTable, mockReturnedOrdersInTable } from "testing/mockData";
import React from "react";
import {
    AdminReturnedItemsTable,
    SimplePendingOrderFulfillmentTable,
} from "./SimpleOrderTables";
import { waitFor } from "@testing-library/react";

describe("<SimplePendingOrderFulfillmentTable />", () => {
    it("Shows tables by default and toggles visibility when button is clicked", async () => {
        const { getByText, queryByText } = render(
            <SimplePendingOrderFulfillmentTable />
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

    it("Does not show complete order button for Ready to Pickup orders", () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />);

        mockPendingOrdersInTable.forEach(({ id, status }) => {
            if (status !== "Cancelled") {
                const { getByText, queryByText } = within(
                    getByTestId(`admin-simple-pending-order-${id}`)
                );
                expect(getByText(`Order #${id}`)).toBeInTheDocument();
                expect(getByText(/reject order/i)).toBeInTheDocument();
                if (status === "Submitted")
                    expect(getByText(/complete order/i)).toBeInTheDocument();
                else expect(queryByText(/complete order/i)).not.toBeInTheDocument();
            }
        });
    });

    it("Disables complete order button when items are unchecked", () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />);

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
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />);

        const order = mockPendingOrdersInTable.find(
            ({ status }) => status === "Submitted"
        );

        if (order) {
            const { getByDisplayValue, getByText } = within(
                getByTestId(`admin-simple-pending-order-${order.id}`)
            );
            expect(getByText(/complete order/i).parentNode).toBeDisabled();
            act(() => {
                order.hardwareInTableRow.forEach(({ id }) => {
                    const checkbox = getByDisplayValue(`hardware-${id}`);
                    expect(checkbox).not.toBeChecked();
                    fireEvent.click(checkbox);
                });
            });
            await waitFor(() => {
                expect(getByText(/complete order/i).parentNode).toBeEnabled();
                expect(getByDisplayValue("checkAll")).toBeChecked();
            });
        }
    });

    test("Check All checkbox is unchecked when some/all rows are unchecked", async () => {
        const { getByTestId } = render(<SimplePendingOrderFulfillmentTable />);

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
    it("Shows tables by default and toggles visibility when button is clicked", async () => {
        const { getByText, queryByText } = render(<AdminReturnedItemsTable />);
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
