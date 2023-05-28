import React from "react";
import { render } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";
import OrderPending from "./OrderPending";

describe("<OrderCard />", () => {
    test("renders order pending card without crashing", () => {
        const teamCode = mockPendingOrders[1].team_code;
        const orderQuantity = mockPendingOrders[1].items.length;
        const time = new Date(mockPendingOrders[1].created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
        const id = mockPendingOrders[1].id;
        const receivedIDs = true
        const date = new Date(time);
        const month = date.toLocaleString("default", { month: "short" });
        const day = date.getDate();
        const hoursAndMinutes = date.getHours() + ":" + date.getMinutes();

        const orderDetails = [
            { title: "Team", value: teamCode },
            { title: "Order Qty", value: orderQuantity },
            { title: "Time ordered", value: `${month} ${day}, ${hoursAndMinutes}` },
            { title: "Received IDs", value: receivedIDs },
            { title: "ID", value: id },
        ];

        const { getByText } = render(
            <OrderPending
            team={teamCode}
            orderQuantity={orderQuantity}
            timeOrdered={time}
            receivedIDs={receivedIDs}
            id={id}
            />
        );
        orderDetails.forEach((item) => {
            expect(getByText(item.title)).toBeInTheDocument();
            expect(getByText(item.value.toString())).toBeInTheDocument();
        });
    });
});
