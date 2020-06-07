import React from "react";
import { render } from "@testing-library/react";
import Dashboard, { cardItems } from "./Dashboard";
import { withRouter } from "testing";

it("renders correctly when the dashboard appears with 2 dash cards and 1 sponsor card", () => {
    const { queryByText } = render(withRouter(<Dashboard />));
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(queryByText(/Thanks to our sponsors/i)).toBeTruthy();
});
