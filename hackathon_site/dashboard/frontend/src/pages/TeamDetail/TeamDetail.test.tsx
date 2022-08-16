import React from "react";
import { makeMockApiListResponse, render, screen, when, waitFor } from "testing/utils";
import { mockOrders, mockTeamMultiple } from "testing/mockData";
import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";
import { Order } from "api/types";
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
    test("renders loading component and then data without crashing", () => {
        const teamOrderAPIResponse = makeMockApiListResponse<Order>(mockOrders);
        when(mockedGet)
            .calledWith(orderAPI, { team_code: teamDetailProps.match.params.id })
            .mockResolvedValue(teamOrderAPIResponse);

        render(<TeamDetail {...teamDetailProps} />);

        expect(screen.getByTestId("team-info-linear-progress")).toBeInTheDocument();
        expect(
            screen.getByText(`Team ${teamDetailProps.match.params.id} Overview`)
        ).toBeInTheDocument();
        expect(mockedGet).toHaveBeenCalledWith(
            `/api/event/teams/${mockTeamMultiple.id}/`
        );
        expect(mockedGet).toBeCalledWith(orderAPI, {
            team_code: teamDetailProps.match.params.id,
        });
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
