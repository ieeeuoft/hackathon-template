import React from "react";
import { render } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { cardItems } from "testing/mockData";
import { withRouter } from "testing";

it("renders correctly when the dashboard appears 4 cards and 3 tables", () => {
    const { queryByText, getByText } = render(withRouter(<Dashboard />));
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(getByText("Returned items")).toBeInTheDocument();
    expect(getByText("Checked out items")).toBeInTheDocument();
    expect(queryByText("Orders pending")).toBeInTheDocument();
});
