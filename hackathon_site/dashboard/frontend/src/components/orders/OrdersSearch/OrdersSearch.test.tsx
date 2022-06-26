import React from "react";
import { render } from "@testing-library/react";
import OrdersFilter from "./OrdersSearch";

describe("<OrderSearch />", () => {
    it("Has necessary component elements", async () => {
        const { getByTestId } = render(<OrdersFilter />);
        expect(getByTestId("search-button")).toBeInTheDocument();
        expect(getByTestId("clear-button")).toBeInTheDocument();
    });
});
