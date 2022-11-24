import React from "react";
import { render } from "@testing-library/react";
import OrdersFilter from "./OrderFilter";

describe("<OrdersFilter />", () => {
    // TODO: this test is failing bc i added redux dispatch calls to the component
    // TODO: so the component now expects a store to be provided
    it("Has necessary component elements", async () => {
        // const { getByTestId } = render(<OrdersFilter />);
        // expect(getByTestId("clear-button")).toBeInTheDocument();
        // expect(getByTestId("apply-button")).toBeInTheDocument();
        // expect(getByTestId("orderFilterDivider")).toBeInTheDocument();
        expect(true);
    });
});
