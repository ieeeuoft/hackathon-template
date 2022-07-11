import React from "react";
import { render } from "@testing-library/react";
import OrdersFilterButton from "./OrdersFilterButton";

describe("<OrdersFilterButton />", () => {
    it("Has necessary component elements", async () => {
        const { getByTestId } = render(<OrdersFilterButton />);
        expect(getByTestId("filter-button")).toBeInTheDocument();
    });
});
