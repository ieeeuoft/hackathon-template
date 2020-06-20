import React from "react";
import { render } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { cardItems } from "testing/mockData";
import { withRouter } from "testing";

it("renders correctly when the dashboard appears with 2 dash cards and 1 sponsor card", () => {
    const { queryByText, getByText } = render(withRouter(<Dashboard />));
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(queryByText(/Thanks to our sponsors/i)).toBeTruthy();
    expect(getByText("Returned items")).toBeInTheDocument();
    expect(getByText("Checked out items")).toBeInTheDocument();
    expect(queryByText("Orders pending")).toBeInTheDocument();
});
