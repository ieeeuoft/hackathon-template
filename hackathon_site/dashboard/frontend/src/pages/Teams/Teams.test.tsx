import React from "react";

import { makeMockApiListResponse, render } from "testing/utils";
import { get } from "api/api";
import { mockTeams } from "testing/mockData";
import { waitFor, when } from "testing/utils";
import Teams from "./Teams";
import { queryByTestId } from "@testing-library/react";
import { NUM_TEAM_LIMIT } from "slices/event/teamAdminSlice";

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
            .calledWith(teamsUri, { limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(teamsApiResponse);

        const { getByText, queryByTestId } = render(<Teams />);

        await waitFor(() => {
            expect(queryByTestId("teams-circular-progress")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith(teamsUri, {
                limit: NUM_TEAM_LIMIT,
            });

            mockTeams.forEach((team) => {
                expect(getByText("Team " + team.team_code)).toBeInTheDocument();
                team.profiles.forEach((profile) => {
                    expect(
                        getByText(
                            `${profile.user.first_name} ${profile.user.last_name}`
                        )
                    ).toBeInTheDocument();
                });
            });
        });
    });
});
