import React from "react";
import {
    makeMockApiListResponse,
    render,
    screen,
    when,
    waitFor,
    makeMockApiResponse,
} from "testing/utils";
import { mockHardware, mockOrders, mockTeam, mockTeamMultiple } from "testing/mockData";
import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";
import { Hardware, Order, Team } from "api/types";
import { get } from "api/api";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const orderAPI = "/api/hardware/orders/";

const mockedGet = get as jest.MockedFunction<typeof get>;

const teamDetailProps = {
    match: {
        params: {
            id: mockTeamMultiple.id.toString(),
        },
    },
} as RouteComponentProps<PageParams>;

describe("<TeamDetail />", () => {
    test("renders loading component and then data without crashing", async () => {
        const teamOrderAPIResponse = makeMockApiListResponse<Order>(mockOrders);
        const teamDetailAPIResponse = makeMockApiResponse(mockTeam);
        when(mockedGet)
            .calledWith(orderAPI, { team_code: teamDetailProps.match.params.id })
            .mockResolvedValue(teamOrderAPIResponse);
        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeamMultiple.id}/`)
            .mockResolvedValue(teamDetailAPIResponse);

        render(<TeamDetail {...teamDetailProps} />);

        expect(screen.getByTestId("team-info-linear-progress")).toBeInTheDocument();

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(
                1,
                `/api/event/teams/${mockTeamMultiple.id}/`
            );
            expect(mockedGet).toHaveBeenNthCalledWith(2, orderAPI, {
                team_code: teamDetailProps.match.params.id,
            });
            expect(mockedGet).toHaveBeenNthCalledWith(3, "/api/hardware/hardware/", {
                hardware_ids: [1, 2, 3, 4, 10],
            });
        });

        expect(
            screen.getByText(`Team ${teamDetailProps.match.params.id} Overview`)
        ).toBeInTheDocument();
    });

    test("displays 404 error when the requested team id is not found", async () => {
        const failureResponse = {
            response: {
                status: 404,
                statusText: "Not Found",
                message: "Could not find team code: Error 404",
            },
        };

        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeamMultiple.id}/`)
            .mockRejectedValue(failureResponse);

        render(<TeamDetail {...teamDetailProps} />);

        await waitFor(() => {
            expect(
                screen.getByText("Could not find team code: Error 404")
            ).toBeInTheDocument();
        });
    });
});
