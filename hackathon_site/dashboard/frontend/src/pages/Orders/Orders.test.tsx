import React from "react";
import { render, within } from "testing/utils";
import { mockHardware, mockPendingOrders } from "testing/mockData";
import Orders from "./Orders";
import { RootStore } from "slices/store";
import { makeStoreWithEntities } from "testing/utils";

describe("Orders Page", () => {
    let store: RootStore;

    beforeEach(() => {
        store = makeStoreWithEntities({
            hardware: mockHardware,
            allOrders: mockPendingOrders,
        });
    });
    test("Has necessary page elements", () => {
        const { getByText, getByTestId } = render(<Orders />, { store });

        expect(getByText("Orders")).toBeInTheDocument();
        expect(getByTestId("ordersCountDivider")).toBeInTheDocument();
    });

    test("Display correct order cards", () => {
        const { getByTestId } = render(<Orders />, { store });
        mockPendingOrders.forEach((order) => {
            const orderStatus = order.status;

            if (orderStatus === "Submitted" || orderStatus === "Ready for Pickup") {
                const orderItem = getByTestId(`order-item-${order.id}`);
                const orderDetails = within(orderItem);
                const date = new Date(order.created_at);
                const month = date.toLocaleString("default", { month: "short" });
                const day = date.getDate();
                const hoursAndMinutes = date.getHours() + ":" + date.getMinutes();

                expect(orderDetails.getByText(order.id)).toBeInTheDocument();
                expect(orderDetails.getByText(order.items.length)).toBeInTheDocument();
                expect(orderDetails.getByText(order.team_code)).toBeInTheDocument();
                expect(
                    orderDetails.getByText(`${month} ${day}, ${hoursAndMinutes}`)
                ).toBeInTheDocument();
            }
            // TODO: Add tests for Checkout Orders in the future
            // else {
            //     expect(
            //         orderDetails.getByText("Order Card Component")
            //     ).toBeInTheDocument();
            // }
        });
    });
    test("Display correct amount of order results", () => {
        const { getByText } = render(<Orders />, { store });
        const orderCount = mockPendingOrders.length;
        const resultText = getByText(`${orderCount} results`);
        expect(resultText).toBeInTheDocument();
    });
});
