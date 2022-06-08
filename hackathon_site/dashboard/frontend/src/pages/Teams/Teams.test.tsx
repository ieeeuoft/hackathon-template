import React from "react";

import { render } from "testing/utils";
import { teamsList } from "testing/mockData";
import Teams from "pages/Teams/Teams";

test("renders without crashing", () => {
    const teamNames = teamsList.map((team) => team.TeamName);
    const { getByText } = render(<Teams />);
    teamNames.forEach(function (teamName) {
        expect(getByText("Team " + teamName)).toBeInTheDocument();
    });
});
