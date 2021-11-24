import React from "react";
import Dashboard from "pages/Dashboard/Dashboard";

import { render } from "testing/utils";
import { cardItems } from "testing/mockData";

it("Renders correctly when the dashboard appears 4 cards and 3 tables", () => {
    const { queryByText, getByText } = render(<Dashboard />);
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(getByText("Checked out items")).toBeInTheDocument();
    expect(getByText("Pending Orders")).toBeInTheDocument();
    // TODO: add check for returned items and broken items when those are ready
});
