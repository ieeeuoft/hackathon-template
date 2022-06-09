import React from "react";

import { render } from "testing/utils";
import { teamsList } from "testing/mockData";
import Teams from "pages/Teams/Teams";

test("renders teams without crashing", () => {
    const teamCodes = teamsList.map((team) => team.TeamName);
    const { getByText } = render(<Teams />);
    teamCodes.forEach((teamCode) => {
        expect(getByText("Team " + teamCode)).toBeInTheDocument();
    });
});
