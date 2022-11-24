import React from "react";
import { render, within } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";
import Orders from "./Orders";

describe("Orders Page", () => {
    test("Has necessary page elements", () => {
        const { getByText, getByTestId } = render(<Orders />);

        expect(getByText("Orders")).toBeInTheDocument();
        expect(getByTestId("ordersCountDivider")).toBeInTheDocument();
    });
    // TODO: after newhacks, implement this test using the new thunk and not mock data
    // test("Display correct order cards", () => {
    //     const { getByText, getByTestId } = render(<Orders />);
    //     mockPendingOrders.forEach((order) => {
    //         const orderItem = getByTestId(`order-item-${order.id}`);
    //         const orderStatus = order.status;
    //         const orderDetails = within(orderItem);
    //
    //         if (orderStatus === "Submitted") {
    //             const date = new Date(order.created_at);
    //             const month = date.toLocaleString("default", { month: "short" });
    //             const day = date.getDate();
    //             const hoursAndMinutes = date.getHours() + ":" + date.getMinutes();
    //
    //             expect(orderDetails.getByText(order.id)).toBeInTheDocument();
    //             expect(orderDetails.getByText(order.items.length)).toBeInTheDocument();
    //             expect(orderDetails.getByText(order.team_code)).toBeInTheDocument();
    //             expect(
    //                 orderDetails.getByText(`${month} ${day}, ${hoursAndMinutes}`)
    //             ).toBeInTheDocument();
    //         } else {
    //             expect(
    //                 orderDetails.getByText("Order Card Component")
    //             ).toBeInTheDocument();
    //         }
    //     });
    // });
});
