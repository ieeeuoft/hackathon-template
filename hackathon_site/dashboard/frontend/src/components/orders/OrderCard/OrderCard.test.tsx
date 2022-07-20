import React from "react";
import { render } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";
import OrderCard from "./OrderCard";

describe("<OrderCard />", () => {
    test("renders order card without crashing", () => {
        const teamCode = mockPendingOrders[1].team_code;
        const orderQuantity = mockPendingOrders[1].items.length;
        const timeOrdered = new Date(
            mockPendingOrders[1].created_at
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const id = mockPendingOrders[1].id;
        const orderDetails = [
            { title: "Team", value: teamCode },
            { title: "Order Qty", value: orderQuantity },
            { title: "Time ordered", value: timeOrdered },
            { title: "ID", value: id },
        ];

        const { getByText } = render(
            <OrderCard
                teamCode={teamCode}
                orderQuantity={orderQuantity}
                timeOrdered={timeOrdered}
                id={id}
            />
        );
        orderDetails.forEach((item) => {
            expect(getByText(item.title)).toBeInTheDocument();
            expect(getByText(item.value.toString())).toBeInTheDocument();
        });
    });
});
