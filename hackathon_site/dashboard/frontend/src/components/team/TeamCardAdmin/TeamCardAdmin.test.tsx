import React from "react";

import { render } from "testing/utils";
import { mockTeam } from "testing/mockData";

import TeamCardAdmin from "components/team/TeamCardAdmin/TeamCardAdmin";

test("renders team card without crashing", () => {
    const teamCode = mockTeam.team_code;
    const members = mockTeam.profiles;

    const { getByText } = render(<TeamCardAdmin {...{ teamCode, members }} />);
    expect(getByText(`Team ${teamCode}`)).toBeInTheDocument();
    members.forEach((member) => {
        expect(
            getByText(`${member.user.first_name} ${member.user.last_name}`)
        ).toBeInTheDocument();
    });
});
