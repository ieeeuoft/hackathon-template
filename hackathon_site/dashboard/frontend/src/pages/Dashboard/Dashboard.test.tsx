import React from "react";
import Dashboard from "pages/Dashboard/Dashboard";

import {
    makeMockApiListResponse,
    render,
    waitFor,
    when,
    fireEvent,
    within,
    promiseResolveWithDelay,
    makeStoreWithEntities,
} from "testing/utils";
import {
    cardItems,
    mockCategories,
    mockCheckedOutOrders,
    mockHardware,
    mockOrders,
    mockTeam,
} from "testing/mockData";
import { get } from "api/api";
import { AxiosResponse } from "axios";
import { Order, Team } from "api/types";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const hardwareUri = "/api/hardware/hardware/";
const categoriesUri = "/api/hardware/categories/";
const teamUri = "/api/event/teams/team/";
const ordersUri = "/api/event/teams/team/orders/";

const teamAPIResponse = { data: mockTeam } as AxiosResponse<Team>;

const mockOrderAPI = (orders?: Order[]) =>
    when(mockedGet)
        .calledWith(ordersUri)
        .mockResolvedValue(makeMockApiListResponse<Order>(orders ?? mockOrders));
const mockTeamAPI = (withDelay?: boolean) =>
    when(mockedGet)
        .calledWith(teamUri)
        .mockResolvedValue(
            withDelay ? promiseResolveWithDelay(teamAPIResponse, 500) : teamAPIResponse
        );

describe("Dashboard Page", () => {
    it("Renders correctly when the dashboard appears 4 cards and 3 tables", async () => {
        mockTeamAPI();
        mockOrderAPI();
        const { queryByText, getByText } = render(<Dashboard />);

        await waitFor(() => {
            for (let e of cardItems) {
                expect(queryByText(e.title)).toBeTruthy();
            }
            expect(getByText("Checked out items")).toBeInTheDocument();
            expect(getByText("Pending Orders")).toBeInTheDocument();
            expect(getByText("Returned items")).toBeInTheDocument();
        });
        // TODO: add check for returned items and broken items when those are ready
    });
    it("Opens Product Overview with the correct hardware information", async () => {
        const hardwareApiResponse = makeMockApiListResponse(mockHardware);
        const categoryApiResponse = makeMockApiListResponse(mockCategories);
        const hardware_ids = [1, 2, 3, 4, 10];

        mockOrderAPI();
        when(mockedGet)
            .calledWith(hardwareUri, { hardware_ids })
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);

        const { getByTestId, getByText } = render(<Dashboard />);

        const hardware = mockHardware.find(
            ({ id }) => id === mockCheckedOutOrders[0].items[0].hardware_id
        );
        const category = mockCategories.find(
            ({ id }) => id === hardware?.categories[0]
        );

        if (hardware && category) {
            await waitFor(() => {
                const infoButton = within(
                    getByTestId(
                        `checked-out-hardware-${hardware.id}-${mockCheckedOutOrders[0].id}`
                    )
                ).getByTestId("info-button");
                fireEvent.click(infoButton);
                expect(getByText("Product Overview")).toBeVisible();
                expect(
                    getByText(`- Max ${hardware.max_per_team} of this item`)
                ).toBeInTheDocument();
                expect(
                    getByText(
                        `- Max ${mockCategories[0].max_per_team} of items under category ${mockCategories[0].name}`
                    )
                ).toBeInTheDocument();
                expect(getByText(hardware.model_number)).toBeInTheDocument();
                expect(getByText(hardware.manufacturer)).toBeInTheDocument();
                if (hardware.notes)
                    expect(getByText(hardware.notes)).toBeInTheDocument();
            });
        }
    });

    it("get info on the current team", async () => {
        mockTeamAPI(true);

        const { getByText, getByTestId, queryByTestId } = render(<Dashboard />);
        await waitFor(() => {
            expect(getByTestId("team-linear-progress")).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(queryByTestId("team-linear-progress")).not.toBeInTheDocument();
            expect(getByText(/foo bar/i)).toBeInTheDocument();
            expect(getByText(/A48E5/i)).toBeInTheDocument();
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/team/");
        });
    });
});

describe("Dashboard Page Error Messages", () => {
    it("Renders order info box when there are fulfillment errors", () => {
        const store = makeStoreWithEntities({
            cartState: {
                fulfillmentError: {
                    order_id: 1,
                    errors: [
                        { hardware_id: 1, message: "No sensors left in inventory" },
                    ],
                },
            },
            cartItems: [],
        });
        const { getByText } = render(<Dashboard />, { store });

        getByText(/there were modifications made to order 1/i);
        getByText(/no sensors left in inventory/i);
    });

    it("Shows error message when there is a problem retrieving orders", async () => {
        mockedGet.mockRejectedValue({
            response: {
                status: 500,
                message: "Something went wrong",
            },
        });
        const { findByText } = render(<Dashboard />);
        await findByText(/Something went wrong/i);
    });

    it("Shows default error message when there is a problem retrieving orders", async () => {
        mockedGet.mockRejectedValue({
            response: {
                status: 500,
            },
        });
        const { findByText } = render(<Dashboard />);
        await findByText(
            /There was a problem retrieving orders. If this continues please contact hackathon organizers/i
        );
    });
});
