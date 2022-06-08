import React from "react";

import { render } from "testing/utils";
import { teamsList } from "testing/mockData";

import Teams from "pages/Teams/Teams";
import TeamCardAdmin from "components/dashboard/TeamCardAdmin/TeamCardAdmin";

test("renders teams without crashing", () => {
    const teamName = teamsList[0].TeamName;
    const members = teamsList[0].Members;

    const { getByText } = render(
        <TeamCardAdmin team_name={teamName} members={members} />
    );
    expect(getByText("Team " + teamName)).toBeInTheDocument();
    members.forEach(function (memberName) {
        expect(getByText(memberName)).toBeInTheDocument();
    });
});
