import React from "react";
import Dashboard from "./Dashboard";

import { render } from "testing/utils";
import { cardItems } from "testing/mockData";

it("Renders correctly when the dashboard appears 4 cards and 3 tables", () => {
    const { queryByText, getByText } = render(<Dashboard />);
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(getByText("Returned items")).toBeInTheDocument();
    expect(getByText("Checked out items")).toBeInTheDocument();
    expect(queryByText("Orders pending")).toBeInTheDocument();
    expect(queryByText("Reported broken/lost items")).toBeInTheDocument();
});
