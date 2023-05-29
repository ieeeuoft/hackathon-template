import React from "react";

import {
    fireEvent,
    makeMockApiListResponse,
    promiseResolveWithDelay,
    render,
} from "testing/utils";
import { get, stripHostnameReturnFilters } from "api/api";
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

    test("Searching for teams", async () => {
        const expectedFilters = {
            limit: NUM_TEAM_LIMIT,
            search: "A48E5",
        };
        const filteredTeams = mockTeams.filter(
            (team) => team.team_code === expectedFilters.search
        );
        const teamsApiResponse = makeMockApiListResponse(mockTeams);
        const searchTeamsApiResponse = makeMockApiListResponse(filteredTeams);

        when(mockedGet)
            .calledWith(teamsUri, { limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(teamsApiResponse);

        when(mockedGet)
            .calledWith(teamsUri, expectedFilters)
            .mockResolvedValue(searchTeamsApiResponse);

        const { getByLabelText, getByText, queryByText } = render(<Teams />);
        const input = getByLabelText(/search teams/i);

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, { limit: NUM_TEAM_LIMIT });
            expect(
                getByText(`SHOWING ${mockTeams.length} OF ${mockTeams.length} TEAMS`)
            ).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: expectedFilters.search } });
        fireEvent.submit(input);

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, expectedFilters);
            expect(
                getByText(
                    `SHOWING ${filteredTeams.length} OF ${filteredTeams.length} TEAMS`
                )
            ).toBeInTheDocument();
            mockTeams.forEach((team) => {
                if (team.team_code === expectedFilters.search)
                    expect(getByText(`Team ${team.team_code}`)).toBeInTheDocument();
                else
                    expect(
                        queryByText(`Team ${team.team_code}`)
                    ).not.toBeInTheDocument();
            });
        });
    });

    test("Searching for teams returns no teams", async () => {
        const expectedFilters = {
            limit: NUM_TEAM_LIMIT,
            search: "12345",
        };

        const teamsApiResponse = makeMockApiListResponse(mockTeams);
        const noTeamsResponse = makeMockApiListResponse([]);

        when(mockedGet)
            .calledWith(teamsUri, { limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(teamsApiResponse);

        when(mockedGet)
            .calledWith(teamsUri, expectedFilters)
            .mockResolvedValue(noTeamsResponse);

        const { getByLabelText, getByText } = render(<Teams />);
        const input = getByLabelText(/search teams/i);

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, { limit: NUM_TEAM_LIMIT });
            expect(
                getByText(`SHOWING ${mockTeams.length} OF ${mockTeams.length} TEAMS`)
            ).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: expectedFilters.search } });
        fireEvent.submit(input);

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, expectedFilters);
            expect(getByText("NO TEAMS FOUND")).toBeInTheDocument();
        });
    });

    it("Loads more teams", async () => {
        const limit = mockTeams.length - 1;
        const nextURL = `http://localhost:8000${teamsUri}?offset=${limit}`;
        const teamsApiResponse = makeMockApiListResponse(
            mockTeams.slice(0, limit),
            nextURL,
            null,
            mockTeams.length
        );
        const teamsNextApiResponse = makeMockApiListResponse(
            mockTeams.slice(limit),
            null,
            teamsUri,
            mockTeams.length
        );

        const { path, filters } = stripHostnameReturnFilters(nextURL);

        when(mockedGet)
            .calledWith(teamsUri, { limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(teamsApiResponse);
        when(mockedGet)
            .calledWith(path, { ...filters, limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(teamsNextApiResponse);

        const { getByText, queryByText } = render(<Teams />);

        await waitFor(() => {
            expect(getByText(`Team ${mockTeams[0].team_code}`)).toBeInTheDocument();
            expect(
                queryByText(`Team ${mockTeams[limit].team_code}`)
            ).not.toBeInTheDocument();
        });

        fireEvent.click(getByText(/load more/i));
        await waitFor(() => {
            mockTeams
                .slice(limit)
                .forEach((team) =>
                    expect(getByText(`Team ${team.team_code}`)).toBeInTheDocument()
                );
        });
    });

    it("Renders loading icon on load more button, then displays teams", async () => {
        const limit = mockTeams.length - 1;
        const nextURL = `http://localhost:8000${teamsUri}?offset=${limit}`;
        const teamsApiResponse = makeMockApiListResponse(
            mockTeams.slice(0, limit),
            nextURL,
            null,
            mockTeams.length
        );
        const teamsNextApiResponse = makeMockApiListResponse(
            mockTeams.slice(limit),
            null,
            teamsUri,
            mockTeams.length
        );

        const { path, filters } = stripHostnameReturnFilters(nextURL);

        when(mockedGet)
            .calledWith(teamsUri, { limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(teamsApiResponse);
        when(mockedGet)
            .calledWith(path, { ...filters, limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(promiseResolveWithDelay(teamsNextApiResponse, 500));

        const { getByText, queryByText, queryByTestId } = render(<Teams />);

        await waitFor(() => {
            expect(getByText(`Team ${mockTeams[0].team_code}`)).toBeInTheDocument();
            expect(
                queryByText(`Team ${mockTeams[limit].team_code}`)
            ).not.toBeInTheDocument();
        });

        fireEvent.click(getByText(/load more/i));

        await waitFor(() => {
            expect(
                queryByTestId("load-more-teams-circular-progress")
            ).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(
                queryByTestId("load-more-teams-circular-progress")
            ).not.toBeInTheDocument();
            for (let team of mockTeams) {
                expect(getByText(`Team ${team.team_code}`)).toBeInTheDocument();
            }
        });
    });
});
