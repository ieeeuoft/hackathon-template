import React from "react";

import { render } from "testing/utils";
import { teamsList } from "testing/mockData";

import Teams from "pages/Teams/Teams";
import TeamCardAdmin from "components/team/TeamCardAdmin/TeamCardAdmin";

test("renders team card without crashing", () => {
    const teamCode = teamsList[0].TeamName;
    const members = teamsList[0].Members;

    const { getByText } = render(<TeamCardAdmin {...{ teamCode, members }} />);
    expect(getByText(`Team ${teamCode}`)).toBeInTheDocument();
    members.forEach((memberName) => {
        expect(getByText(memberName)).toBeInTheDocument();
    });
});
