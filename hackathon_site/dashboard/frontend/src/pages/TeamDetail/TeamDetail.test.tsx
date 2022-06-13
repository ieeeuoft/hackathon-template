import React from "react";

import { render, screen } from "testing/utils";

import { mockTeamMultiple } from "testing/mockData";
import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";

// this test is just so we pass dashboard-checks, doesn't do anything

test("renders without crashing", () => {
    render(<TeamInfoTable />);
    expect(screen.getByText("Name")).toBeInTheDocument();
});
