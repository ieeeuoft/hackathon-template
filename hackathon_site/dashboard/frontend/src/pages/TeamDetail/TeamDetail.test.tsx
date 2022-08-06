import React from "react";

import { render, screen, waitFor } from "testing/utils";

import { mockTeam, mockTeamMultiple } from "testing/mockData";
import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";
import { get } from "api/api";
import { AxiosResponse } from "axios";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;

const teamDetailProps = {
    match: {
        params: {
            id: mockTeamMultiple.id.toString(),
        },
    },
} as RouteComponentProps<PageParams>;

describe("<TeamDetail />", () => {
    test("renders loading component and then data without crashing", () => {
        render(<TeamDetail {...teamDetailProps} />);

        expect(screen.getByTestId("team-info-linear-progress")).toBeInTheDocument();

        expect(
            screen.getByText(`Team ${teamDetailProps.match.params.id} Overview`)
        ).toBeInTheDocument();

        expect(mockedGet).toHaveBeenCalledWith(
            `/api/event/teams/${mockTeamMultiple.id}/`
        );
    });

    test("displays 404 error when the requested team id is not found", async () => {
        const failureResponse = {
            response: {
                status: 404,
                statusText: "Not Found",
                message: "Could not find team code: Error 404",
            },
        };

        mockedGet.mockRejectedValueOnce(failureResponse);

        render(<TeamDetail {...teamDetailProps} />);

        await waitFor(() => {
            expect(
                screen.getByText("Could not find team code: Error 404")
            ).toBeInTheDocument();
        });
    });
});
