import React from "react";
import { render, screen } from "testing/utils";
import { mockTeamMultiple } from "testing/mockData";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";

describe("team info table", () => {
    test("renders team info table", () => {
        const { container } = render(<TeamInfoTable />);
        const checkboxes = container.getElementsByClassName("MuiCheckbox-root");

        expect(screen.getByText("Team info")).toBeInTheDocument();
    });
});
