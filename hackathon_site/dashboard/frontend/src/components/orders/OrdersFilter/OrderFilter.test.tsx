import React from "react";
import { render } from "@testing-library/react";
import OrdersFilter from "./OrderFilter";

describe("<OrdersFilter />", () => {
    it("Has necessary component elements", async () => {
        const { getByTestId } = render(<OrdersFilter />);
        expect(getByTestId("clear-button")).toBeInTheDocument();
        expect(getByTestId("apply-button")).toBeInTheDocument();
        expect(getByTestId("orderFilterDivider")).toBeInTheDocument();
    });
});
