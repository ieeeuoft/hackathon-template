import React from "react";
import { render } from "@testing-library/react";
import OrdersFilter from "./OrdersFilterButton";

describe("<OrdersFilter />", () => {
    it("Has necessary component elements", async () => {
        const { getByTestId } = render(<OrdersFilter />);
        expect(getByTestId("filter-button")).toBeInTheDocument();
    });
});
