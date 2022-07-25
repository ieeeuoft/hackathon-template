import React from "react";

import { makeMockApiListResponse, render } from "testing/utils";
import { get } from "api/api";
import { mockTeams } from "../../testing/mockData";
import { waitFor, when } from "../../testing/utils";
import Teams from "./Teams";
import { queryByTestId } from "@testing-library/react";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const teamsUri = "/api/event/teams/";

describe("Teams Page", () => {
    it("Renders the teams", async () => {
        const teamsApiResponse = makeMockApiListResponse(mockTeams);

        when(mockedGet)
            .calledWith(teamsUri, { limit: 24 })
            .mockResolvedValue(teamsApiResponse);

        const { getByText, queryByTestId } = render(<Teams />);
        const teamCodes = mockTeams.map((team) => team.team_code);
        const allTeamMembers = mockTeams.map((team) =>
            team.profiles.map(
                (member) => `${member.user.first_name} ${member.user.last_name}`
            )
        );

        await waitFor(() => {
            expect(queryByTestId("teams-circular-progress")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(get).toHaveBeenNthCalledWith(1, teamsUri, { limit: 24 });

            teamCodes.forEach((teamCode) => {
                expect(getByText("Team " + teamCode)).toBeInTheDocument();
            });

            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/", { limit: 24 });

            allTeamMembers.forEach((members) => {
                members.forEach((member) => {
                    expect(getByText(member)).toBeInTheDocument();
                });
            });
        });
    });
});
