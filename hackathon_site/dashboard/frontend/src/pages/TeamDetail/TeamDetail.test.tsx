import React from "react";
import { makeMockApiListResponse, render, screen, when } from "testing/utils";
import { mockOrders, mockTeamMultiple } from "testing/mockData";
import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";
import { Order } from "api/types";
import { get } from "api/api";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const orderAPI = "/api/hardware/orders/";

const teamDetailProps = {
    match: {
        params: {
            id: mockTeamMultiple.id.toString(),
        },
    },
} as RouteComponentProps<PageParams>;

describe("<TeamDetail/>", () => {
    it("renders without crashing", () => {
        render(<TeamDetail {...teamDetailProps} />);
        expect(
            screen.getByText(`Team ${teamDetailProps.match.params.id} Overview`)
        ).toBeInTheDocument();
    });

    it("renders team's orders from api", () => {
        const teamOrderAPIResponse = makeMockApiListResponse<Order>(mockOrders);

        when(mockedGet)
            .calledWith(orderAPI, { team_code: teamDetailProps.match.params.id })
            .mockResolvedValue(teamOrderAPIResponse);
        render(<TeamDetail {...teamDetailProps} />);
        expect(mockedGet).toBeCalledWith(orderAPI, {
            team_code: teamDetailProps.match.params.id,
        });
    });
});
