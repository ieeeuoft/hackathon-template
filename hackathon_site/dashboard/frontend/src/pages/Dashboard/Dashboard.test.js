import React from "react";
import { render } from "@testing-library/react";
import Dashboard, { cardItems } from "./Dashboard";

it("renders correctly when the dashboard appears with 2 dash cards and 1 sponsor card", () => {
    const { queryByText } = render(<Dashboard />);
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(queryByText(/Thanks to our sponsors/i)).toBeTruthy();
});
