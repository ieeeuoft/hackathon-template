import React from "react";
import { render } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";
import OrderCard from "./OrderCard";

describe("<OrderCard />", () => {
    test("renders order card without crashing", () => {
        const teamCode = mockPendingOrders[1].team_code;
        const orderQuantity = mockPendingOrders[1].items.length;
        const time = new Date(mockPendingOrders[1].created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
        const id = mockPendingOrders[1].id;
        const status = mockPendingOrders[1].status;
        const date = new Date(time);
        const month = date.toLocaleString("default", { month: "short" });
        const day = date.getDate();
        const hoursAndMinutes = date.getHours() + ":" + date.getMinutes();

        const orderDetails = [
            { title: "Team", value: teamCode },
            { title: "Order Qty", value: orderQuantity },
            { title: "Time", value: `${month} ${day}, ${hoursAndMinutes}` },
            { title: "ID", value: id },
            { title: "Status", value: status },
        ];

        const { getByText } = render(
            <OrderCard
                teamCode={teamCode}
                orderQuantity={orderQuantity}
                time={time}
                id={id}
                status={status}
            />
        );
        orderDetails.forEach((item) => {
            expect(getByText(item.title)).toBeInTheDocument();
            expect(getByText(item.value.toString())).toBeInTheDocument();
        });
    });
});
