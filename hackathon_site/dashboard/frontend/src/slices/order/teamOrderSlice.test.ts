import store, { makeStore, RootState } from "slices/store";
import {
    mockCheckedOutOrdersInTable,
    mockOrders,
    mockPendingOrdersInTable,
    mockReturnedOrder,
    mockReturnedOrdersInTable,
    mockSubmittedOrder,
    mockTeam,
} from "testing/mockData";
import {
    makeMockApiListResponse,
    makeMockApiResponse,
    makeStoreWithEntities,
    waitFor,
} from "testing/utils";
import { get, patch, post } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";
import {
    teamOrderReducerName,
    initialState,
    teamOrderSliceSelector,
    isLoadingSelector,
    errorSelector,
    teamOrderSelectors,
    hardwareInOrdersSelector,
    getAdminTeamOrders,
    returnedOrdersSelector,
    pendingOrdersSelector,
    checkedOutOrdersSelector,
    TeamOrderState,
    updateOrderStatus,
    isReturnedLoadingSelector,
    returnItems,
} from "slices/order/teamOrderSlice";
import {
    getTeamInfoData,
    teamDetailAdapterSelector,
    updateParticipantIdErrorSelector,
    updateParticipantIdProvided,
} from "slices/event/teamDetailSlice";
import { OrderStatus } from "api/types";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPost = post as jest.MockedFunction<typeof post>;
const mockedPatch = patch as jest.MockedFunction<typeof patch>;

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);
const mockStateWithTeamOrderState = (teamOrderState?: Partial<TeamOrderState>) => ({
    ...store.getState(),
    [teamOrderReducerName]: {
        ...initialState,
        ...teamOrderState,
    },
});

const mockState: RootState = {
    ...store.getState(),
    [teamOrderReducerName]: {
        ...initialState,
    },
};

const statusFailureResponse = {
    response: {
        status: 404,
        statusText: "Not Found",
        message: "Could not update order status: Error 404",
    },
};

const returnStatusFailureResponse = {
    response: {
        status: 404,
        statusText: "Not Found",
        message: "Could not return order: Error 404",
    },
};

const combinedOrders = [...mockPendingOrdersInTable, ...mockCheckedOutOrdersInTable];

describe("Selectors", () => {
    const mockState = mockStateWithTeamOrderState();

    test("teamOrderSliceSelector returns the team order store", () => {
        expect(teamOrderSliceSelector(mockState)).toEqual(
            mockState[teamOrderReducerName]
        );
    });

    test("isReturnedLoadingSelector", () => {
        const loadingTrueState = mockStateWithTeamOrderState({
            returnedIsLoading: true,
        });
        const loadingFalseState = mockStateWithTeamOrderState({
            returnedIsLoading: false,
        });
        expect(isReturnedLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isReturnedLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = mockStateWithTeamOrderState({ isLoading: true });
        const loadingFalseState = mockStateWithTeamOrderState({ isLoading: false });
        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("teamOrderErrorSelector", () => {
        const errorExistsState = mockStateWithTeamOrderState({ error: "exists" });
        const errorNullState = mockStateWithTeamOrderState({ error: null });
        expect(errorSelector(errorExistsState)).toEqual("exists");
        expect(errorSelector(errorNullState)).toEqual(null);
    });

    test("team orders selector", () => {
        const store = makeStoreWithEntities({
            teamDetailOrders: combinedOrders,
        });
        expect(teamOrderSelectors.selectIds(store.getState())).toEqual(
            combinedOrders.map(({ id }) => id)
        );
    });

    test("hardwareInOrdersSelector", () => {
        const hasHardwareInOrders = mockStateWithTeamOrderState({
            hardwareIdsToFetch: [1, 2, 3],
        });
        expect(hardwareInOrdersSelector(hasHardwareInOrders)).toEqual([1, 2, 3]);
    });
});

describe("getTeamOrders Thunk", () => {
    it("Updates the store on API success", async () => {
        const { team_code } = mockTeam;
        const response = makeMockApiListResponse(mockOrders);
        mockedGet.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(getAdminTeamOrders(team_code));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/hardware/orders/", {
                team_code,
            });
            expect(pendingOrdersSelector(store.getState())).toEqual(
                mockPendingOrdersInTable
            );
            expect(checkedOutOrdersSelector(store.getState())).toEqual(
                mockCheckedOutOrdersInTable
            );
            expect(returnedOrdersSelector(store.getState())).toEqual(
                mockReturnedOrdersInTable
            );
            expect(hardwareInOrdersSelector(store.getState())).toEqual([
                1, 2, 3, 4, 10,
            ]);
        });
    });

    it("Updates the store on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "There was a problem loading orders",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = makeStore();
        await store.dispatch(getAdminTeamOrders(mockTeam.team_code));

        expect(store.getState()[teamOrderReducerName]).toHaveProperty(
            "error",
            failureResponse.response.message
        );
    });

    it("Dispatches snackbar on api failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "There was a problem loading orders",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = mockStore(mockState);
        await store.dispatch(getAdminTeamOrders(mockTeam.team_code));
        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "There was a problem loading orders",
                options: { variant: "error" },
            })
        );
    });
});

describe("updateOrderStatus Thunk", () => {
    it("Updates the order status on API success", async () => {
        // populate the store
        const { team_code } = mockTeam;
        let mockResponse = makeMockApiListResponse(mockOrders);
        mockedGet.mockResolvedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getAdminTeamOrders(team_code));

        // change one order status
        const mockOrderResponse = { ...mockSubmittedOrder };
        mockOrderResponse.status = "Ready for Pickup";
        mockResponse = makeMockApiResponse(mockOrderResponse);
        mockedPatch.mockResolvedValueOnce(mockResponse);

        await store.dispatch(
            updateOrderStatus({
                id: mockSubmittedOrder.id,
                status: "Ready for Pickup",
            })
        );

        await waitFor(() => {
            expect(mockedPatch).toHaveBeenCalledWith(
                `/api/hardware/orders/${mockSubmittedOrder.id}/`,
                {
                    status: "Ready for Pickup",
                }
            );
            expect(
                teamOrderSelectors.selectById(store.getState(), mockSubmittedOrder.id)
                    ?.status
            ).toEqual("Ready for Pickup");
        });
    });

    it("Dispatches snackbar on API failure", async () => {
        mockedPatch.mockRejectedValueOnce(statusFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(
            updateOrderStatus({
                id: mockSubmittedOrder.id,
                status: "Ready for Pickup",
            })
        );

        expect(mockedPatch).toHaveBeenCalledWith(
            `/api/hardware/orders/${mockSubmittedOrder.id}/`,
            {
                status: "Ready for Pickup",
            }
        );

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Could not update order status: Error 404",
                options: { variant: "error" },
            })
        );
    });
});

describe("returnItems Thunk", () => {
    const hardware = [
        {
            id: mockReturnedOrder[0].returned_items[0].hardware_id,
            quantity: mockReturnedOrder[0].returned_items[0].quantity,
            part_returned_health: "Healthy",
        },
    ];
    it("Returns items on API success", async () => {
        // populate the store
        const { team_code } = mockTeam;
        let mockResponse = makeMockApiListResponse(mockOrders);
        mockedGet.mockResolvedValueOnce(mockResponse);
        const store = makeStore();
        await store.dispatch(getAdminTeamOrders(team_code));

        const mockReturnOrderResponse = { ...mockReturnedOrder };
        mockResponse = makeMockApiResponse(mockReturnOrderResponse);
        mockedPost.mockResolvedValueOnce(mockResponse);
        await store.dispatch(
            returnItems({ hardware, order: mockReturnedOrder[0].order_id })
        );

        await waitFor(() => {
            expect(mockedPost).toHaveBeenCalledWith(`/api/hardware/orders/returns/`, {
                hardware,
                order: mockReturnedOrder[0].order_id,
            });
            expect(returnedOrdersSelector(store.getState())).toEqual(
                mockReturnedOrdersInTable
            );
        });
    });

    it("Dispatches snackbar on API failure", async () => {
        mockedPost.mockRejectedValueOnce(returnStatusFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(
            returnItems({ hardware, order: mockCheckedOutOrdersInTable[0].id })
        );

        expect(mockedPost).toHaveBeenCalledWith(`/api/hardware/orders/returns/`, {
            hardware,
            order: mockCheckedOutOrdersInTable[0].id,
        });

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Could not return order: Error 404",
                options: { variant: "error" },
            })
        );
    });
});
