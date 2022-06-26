import React from "react";
import { render } from "@testing-library/react";
import OrdersFilter from "./OrdersCount";

describe("<OrdersCount />", () => {
    it("Has necessary component elements", async () => {
        const { getByText, getByTestId } = render(<OrdersFilter />);
        expect(getByTestId("refreshOrders")).toBeInTheDocument();
        expect(getByText("2 results")).toBeInTheDocument();
    });
});
