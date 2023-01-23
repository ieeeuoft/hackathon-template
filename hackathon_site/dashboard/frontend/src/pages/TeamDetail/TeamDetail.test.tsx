import React from "react";
import {
    makeMockApiListResponse,
    render,
    screen,
    when,
    waitFor,
    makeMockApiResponse,
    fireEvent,
    within,
} from "testing/utils";
import {
    mockCategories,
    mockCheckedOutOrders,
    mockHardware,
    mockOrders,
    mockTeam,
    mockTeamMultiple,
} from "testing/mockData";
import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";
import { Hardware, Order } from "api/types";
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
            code: mockTeamMultiple.team_code.toString(),
        },
    },
} as RouteComponentProps<PageParams>;

const hardwareUri = "/api/hardware/hardware/";
const categoriesUri = "/api/hardware/categories/";

describe("<TeamDetail />", () => {
    test("renders loading component and then data without crashing", async () => {
        const teamOrderAPIResponse = makeMockApiListResponse<Order>(mockOrders);
        const teamDetailAPIResponse = makeMockApiResponse(mockTeam);
        when(mockedGet)
            .calledWith(orderAPI, { team_code: teamDetailProps.match.params.code })
            .mockResolvedValue(teamOrderAPIResponse);
        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeamMultiple.team_code}/`)
            .mockResolvedValue(teamDetailAPIResponse);

        render(<TeamDetail {...teamDetailProps} />);

        expect(screen.getByTestId("team-info-linear-progress")).toBeInTheDocument();

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(
                1,
                `/api/event/teams/${mockTeamMultiple.team_code}/`
            );
            expect(mockedGet).toHaveBeenNthCalledWith(2, categoriesUri, {});
            expect(mockedGet).toHaveBeenNthCalledWith(3, orderAPI, {
                team_code: teamDetailProps.match.params.code,
            });
            expect(mockedGet).toHaveBeenNthCalledWith(4, "/api/hardware/hardware/", {
                hardware_ids: [1, 2, 3, 4, 10],
            });
        });

        expect(
            screen.getByText(`Team ${teamDetailProps.match.params.code} Overview`)
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
            .calledWith(`/api/event/teams/${mockTeamMultiple.team_code}/`)
            .mockRejectedValue(failureResponse);

        render(<TeamDetail {...teamDetailProps} />);

        await waitFor(() => {
            expect(
                screen.getByText("Could not find team code: Error 404")
            ).toBeInTheDocument();
        });
    });

    test("Opens Product Overview with the correct hardware information", async () => {
        const hardwareDetailUri = "/api/hardware/hardware/1/";
        const newHardwareData: Hardware = {
            ...mockHardware[0],
            name: "Random hardware",
            model_number: "90",
            manufacturer: "Tesla",
            datasheet: "",
            quantity_available: 5,
            max_per_team: 6,
            picture: "https://example.com/datasheet",
            categories: [2],
            quantity_remaining: 10,
            notes: "notes on temp",
        };

        const hardwareApiResponse = makeMockApiListResponse(mockHardware);
        const categoryApiResponse = makeMockApiListResponse(mockCategories);
        const hardwareDetailApiResponse = makeMockApiResponse(newHardwareData);
        const hardware_ids = [1, 2, 3, 4, 10];

        const teamOrderAPIResponse = makeMockApiListResponse<Order>(mockOrders);
        const teamDetailAPIResponse = makeMockApiResponse(mockTeamMultiple);

        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeamMultiple.team_code}/`)
            .mockResolvedValue(teamDetailAPIResponse);
        when(mockedGet)
            .calledWith(orderAPI, { team_code: teamDetailProps.match.params.code })
            .mockResolvedValue(teamOrderAPIResponse);
        when(mockedGet)
            .calledWith(hardwareUri, { hardware_ids })
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);
        when(mockedGet)
            .calledWith(hardwareDetailUri)
            .mockResolvedValue(hardwareDetailApiResponse);

        const { getByTestId, getByText } = render(<TeamDetail {...teamDetailProps} />);

        expect(screen.getByTestId("team-info-linear-progress")).toBeInTheDocument();

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(
                1,
                `/api/event/teams/${mockTeamMultiple.team_code}/`
            );
            expect(mockedGet).toHaveBeenNthCalledWith(2, categoriesUri, {});
            expect(mockedGet).toHaveBeenNthCalledWith(3, orderAPI, {
                team_code: teamDetailProps.match.params.code,
            });
            expect(mockedGet).toHaveBeenNthCalledWith(4, "/api/hardware/hardware/", {
                hardware_ids: [1, 2, 3, 4, 10],
            });
        });

        expect(
            screen.getByText(`Team ${teamDetailProps.match.params.code} Overview`)
        ).toBeInTheDocument();

        const category = mockCategories.find(
            ({ id }) => id === newHardwareData?.categories[0]
        );

        if (category) {
            await waitFor(() => {
                const infoButton = within(
                    getByTestId(
                        `table-${newHardwareData.id}-${mockCheckedOutOrders[0].id}`
                    )
                ).getByTestId("info-button");
                fireEvent.click(infoButton);
            });
            await waitFor(() => {
                expect(mockedGet).toHaveBeenNthCalledWith(5, hardwareDetailUri);
                expect(getByText("Product Overview")).toBeVisible();
                expect(
                    getByText(`- Max ${newHardwareData.max_per_team} of this item`)
                ).toBeInTheDocument();
                expect(
                    getByText(
                        `- Max ${category.max_per_team} of items under category ${category.name}`
                    )
                ).toBeInTheDocument();
                expect(getByText(newHardwareData.model_number)).toBeInTheDocument();
                expect(getByText(newHardwareData.manufacturer)).toBeInTheDocument();
                if (newHardwareData.notes)
                    expect(getByText(newHardwareData.notes)).toBeInTheDocument();
            });
        }
    });
});
