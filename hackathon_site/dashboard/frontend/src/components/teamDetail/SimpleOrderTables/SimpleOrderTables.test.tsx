import { fireEvent, render } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";
import React from "react";
import { SimplePendingOrderFulfillmentTable } from "./SimpleOrderTables";

describe("<SimplePendingOrderFulfillmentTable />", () => {
    it("Shows tables by default and toggles visibility when button is clicked", async () => {
        const { getByText, queryByText } = render(
            <SimplePendingOrderFulfillmentTable />
        );
        const button = getByText(/hide all/i);

        mockPendingOrders.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });

    it("Does not show complete order button for Ready to Pickup orders", () => {});
});

describe("<AdminReturnedItemsTable />", () => {
    it("Shows tables by default and toggles visibility when button is clicked", async () => {
        const { getByText, queryByText } = render(
            <SimplePendingOrderFulfillmentTable />
        );
        const button = getByText(/hide all/i);

        mockPendingOrders.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });
});
