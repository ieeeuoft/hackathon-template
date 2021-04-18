import React from "react";
import { render } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { cardItems } from "testing/mockData";
import { withRouter, withStore } from "testing/helpers";

it("Renders correctly when the dashboard appears 4 cards and 3 tables", () => {
    const { queryByText, getByText } = render(withStore(withRouter(<Dashboard />)));
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(getByText("Returned items")).toBeInTheDocument();
    expect(getByText("Checked out items")).toBeInTheDocument();
    expect(queryByText("Orders pending")).toBeInTheDocument();
    expect(queryByText("Reported broken/lost items")).toBeInTheDocument();
});
