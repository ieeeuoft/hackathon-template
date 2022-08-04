import React from "react";

import { render, screen } from "testing/utils";

import { mockTeam, mockTeamMultiple } from "testing/mockData";
import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";
import { get } from "../../api/api";
import { AxiosResponse } from "axios";
import { Team } from "../../api/types";
import TeamInfoTable from "../../components/teamDetail/TeamInfoTable/TeamInfoTable";
import { makeStore } from "../../slices/store";

// TODO: test that /teams/{id} api was called once
jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;

test("renders without crashing", () => {
    const teamDetailProps = {
        match: {
            params: {
                id: mockTeamMultiple.id.toString(),
            },
        },
    } as RouteComponentProps<PageParams>;
    render(<TeamDetail {...teamDetailProps} />);

    expect(
        screen.getByText(`Team ${teamDetailProps.match.params.id} Overview`)
    ).toBeInTheDocument();

    expect(mockedGet).toHaveBeenCalledWith(`/api/event/teams/${mockTeamMultiple.id}/`);
});

test("displays 404 error when the requested team id is not found", () => {
    // render the page with an error
    const failureResponse = {
        response: {
            status: 404,
            statusText: "Not Found",
            message: "Could not find team code: Error 404",
        },
    };

    mockedGet.mockRejectedValueOnce(failureResponse);

    const teamDetailProps = {
        match: {
            params: {
                id: "abc",
            },
        },
    } as RouteComponentProps<PageParams>;
    // const store = makeStore();
    render(<TeamDetail {...teamDetailProps} />);
    expect(screen.getByText("Could not find team code: Error 404")).toBeInTheDocument();
});
