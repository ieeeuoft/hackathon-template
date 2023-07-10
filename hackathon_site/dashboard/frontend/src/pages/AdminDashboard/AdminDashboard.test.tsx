import React from "react";
import AdminDashboard from "pages/AdminDashboard/AdminDashboard";

import { makeStoreWithEntities, render, waitFor } from "testing/utils";
import { RootStore } from "slices/store";
import { within } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";

describe("Admin Dashboard Page", () => {
    let store: RootStore;

    beforeEach(() => {
        store = makeStoreWithEntities({
            allOrders: mockPendingOrders,
        });
    });
    test("Display correct order cards", () => {
        const { getByText, getByTestId } = render(<AdminDashboard />, { store });
        mockPendingOrders.forEach((order) => {
            const orderStatus = order.status;

            if (orderStatus === "Submitted" || orderStatus === "Ready for Pickup") {
                const orderItem = getByTestId(`order-item-${order.id}`);
                const orderDetails = within(orderItem);
                const date = new Date(order.updated_at);
                const month = date.toLocaleString("default", { month: "short" });
                const day = date.getDate();
                const hoursAndMinutes =
                    date.getHours() +
                    ":" +
                    ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes());

                expect(orderDetails.getByText(order.team_code)).toBeInTheDocument();
                expect(orderDetails.getByText(order.items.length)).toBeInTheDocument();
                expect(orderDetails.getByText(order.id)).toBeInTheDocument();
                expect(orderDetails.getByText(order.status)).toBeInTheDocument();
                expect(
                    orderDetails.getByText(`${month} ${day}, ${hoursAndMinutes}`)
                ).toBeInTheDocument();
            }
        });
    });

    test("Renders correctly when the dashboard appears with Title texts", async () => {
        const { getByText } = render(<AdminDashboard />);

        await waitFor(() => {
            expect(getByText("Hackathon Name Admin Dashboard")).toBeInTheDocument();
            expect(getByText("Overview")).toBeInTheDocument();
            expect(getByText("Pending Orders")).toBeInTheDocument();
        });
    });
});
