import React from "react";
import { render } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";
import OrderCard from "./OrderCard";

test("renders order card without crashing", () => {
    const teamId = mockPendingOrders[1].team_id;
    const orderQuantity = mockPendingOrders[1].items.length;
    const timeOrdered = new Date(mockPendingOrders[1].created_at).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
    );
    const id = mockPendingOrders[1].id;
    const arr = [
        { title: "Team", value: teamId },
        { title: "Order Qty", value: orderQuantity },
        { title: "Time ordered", value: timeOrdered },
        { title: "ID", value: id },
    ];

    const { getByText } = render(
        <OrderCard
            teamId={teamId}
            orderQuantity={orderQuantity}
            timeOrdered={timeOrdered}
            id={id}
        />
    );
    arr.forEach((item) => {
        expect(getByText(item.title)).toBeInTheDocument();
        expect(getByText(item.value.toString())).toBeInTheDocument();
    });
});
