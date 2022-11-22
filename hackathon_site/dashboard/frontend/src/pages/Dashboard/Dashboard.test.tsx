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
    makeMockApiResponse,
} from "testing/utils";
import {
    cardItems,
    mockCategories,
    mockCheckedOutOrders,
    mockHardware,
    mockOrders,
    mockPendingOrders,
    mockPendingOrdersInTable,
    mockTeam,
} from "testing/mockData";
import { get, patch } from "api/api";
import { AxiosResponse } from "axios";
import { Hardware, Order, Team } from "api/types";
import { pendingOrderSelectors } from "slices/order/orderSlice";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    patch: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPatch = patch as jest.MockedFunction<typeof patch>;

const hardwareUri = "/api/hardware/hardware/";
const categoriesUri = "/api/hardware/categories/";
const teamUri = "/api/event/teams/team/";
const ordersUri = "/api/event/teams/team/orders/";

const mockOrderAPI = (orders?: Order[]) =>
    when(mockedGet)
        .calledWith(ordersUri)
        .mockResolvedValue(makeMockApiListResponse<Order>(orders ?? mockOrders));
const mockTeamAPI = (withDelay?: boolean) => {
    const teamAPIResponse = makeMockApiResponse(mockTeam);
    when(mockedGet)
        .calledWith(teamUri)
        .mockResolvedValue(
            withDelay ? promiseResolveWithDelay(teamAPIResponse, 500) : teamAPIResponse
        );
};

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
        const hardwareDetailUri = "/api/hardware/hardware/1/";
        const newHardwareData: Hardware = {
            id: mockCheckedOutOrders[0].items[0].hardware_id,
            name: "Randome hardware",
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

        mockOrderAPI();
        when(mockedGet)
            .calledWith(hardwareUri, { hardware_ids })
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);
        when(mockedGet)
            .calledWith(hardwareDetailUri)
            .mockResolvedValue(hardwareDetailApiResponse);

        const { getByTestId, getByText } = render(<Dashboard />);

        const category = mockCategories.find(
            ({ id }) => id === newHardwareData?.categories[0]
        );

        if (category) {
            await waitFor(() => {
                expect(get).toHaveBeenNthCalledWith(1, teamUri);
                expect(get).toHaveBeenNthCalledWith(2, categoriesUri, {});
                expect(get).toHaveBeenNthCalledWith(3, ordersUri);
                expect(get).toHaveBeenNthCalledWith(4, hardwareUri, { hardware_ids });
            });
            await waitFor(() => {
                const infoButton = within(
                    getByTestId(
                        `checked-out-hardware-${newHardwareData.id}-${mockCheckedOutOrders[0].id}`
                    )
                ).getByTestId("info-button");
                fireEvent.click(infoButton);
            });
            await waitFor(() => {
                expect(get).toHaveBeenNthCalledWith(5, hardwareDetailUri);
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

    it("Removes orders when cancel order button is clicked", async () => {
        mockTeamAPI();
        mockOrderAPI(mockPendingOrders);
        const pendingOrderDetailUri = "/api/event/teams/team/orders/4";
        const pendingOrderResponse = makeMockApiResponse(mockPendingOrdersInTable[1]);
        when(mockedPatch)
            .calledWith(pendingOrderDetailUri, { status: "Cancelled" })
            .mockResolvedValueOnce(pendingOrderResponse);

        const store = makeStoreWithEntities({});

        const { getByTestId, queryByText, getByText } = render(<Dashboard />, {
            store,
        });

        await waitFor(() => {
            mockPendingOrdersInTable.forEach((order) => {
                expect(getByText(`Order #${order.id}`)).toBeInTheDocument();
            });
        });

        const orderItem = getByTestId(
            `pending-order-table-${mockPendingOrdersInTable[1].id}`
        );
        const cancelOrderBtn = within(orderItem).getByTestId("cancel-order-button");
        fireEvent.click(cancelOrderBtn);

        // Make sure cancel order button on modal is called
        const confirmCancelOrderBtn = getByText(/Delete Order/i);
        fireEvent.click(confirmCancelOrderBtn);

        await waitFor(() => {
            expect(mockedPatch).toHaveBeenCalledWith(`/api/event/teams/team/orders/4`, {
                status: "Cancelled",
            });
            expect(pendingOrderSelectors.selectById(store.getState(), 4)).toEqual(
                undefined
            );
            expect(queryByText(/order #4/i)).toEqual(null);
            expect(orderItem).not.toBeInTheDocument();
            expect(cancelOrderBtn).not.toBeInTheDocument();
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
        mockTeamAPI();
        const { getByText } = render(<Dashboard />, { store });

        waitFor(() => {
            getByText(/there were modifications made to order 1/i);
            getByText(/no sensors left in inventory/i);
        });
    });

    it("Shows error message when there is a problem retrieving orders", async () => {
        mockTeamAPI();
        when(mockedGet)
            .calledWith(ordersUri)
            .mockRejectedValue({
                response: {
                    status: 500,
                    message: "Something went wrong",
                },
            });
        const { findByText } = render(<Dashboard />);
        await findByText(/Something went wrong/i);
    });

    it("Shows default error message when there is a problem retrieving orders", async () => {
        mockTeamAPI();
        when(mockedGet)
            .calledWith(ordersUri)
            .mockRejectedValue({
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

describe("Dashboard Page Edit Team Model", () => {
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
        mockTeamAPI();
        const { getByText } = render(<Dashboard />, { store });

        waitFor(() => {
            getByText(/there were modifications made to order 1/i);
            getByText(/no sensors left in inventory/i);
        });
    });

    it("Shows error message when there is a problem retrieving orders", async () => {
        mockTeamAPI();
        when(mockedGet)
            .calledWith(ordersUri)
            .mockRejectedValue({
                response: {
                    status: 500,
                    message: "Something went wrong",
                },
            });
        const { findByText } = render(<Dashboard />);
        await findByText(/Something went wrong/i);
    });

    it("Shows default error message when there is a problem retrieving orders", async () => {
        mockTeamAPI();
        when(mockedGet)
            .calledWith(ordersUri)
            .mockRejectedValue({
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
