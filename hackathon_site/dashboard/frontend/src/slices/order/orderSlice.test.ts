import store, { makeStore, RootState } from "slices/store";
import {
    orderReducerName,
    orderSliceSelector,
    isLoadingSelector,
    orderErrorSelector,
    initialState,
    checkedOutOrdersSelector,
    returnedOrdersSelector,
    OrderState,
    pendingOrderSelectors,
    hardwareInOrdersSelector,
    getTeamOrders,
    cancelOrderLoadingSelector,
    cancelOrderThunk,
} from "slices/order/orderSlice";
import {
    mockCheckedOutOrdersInTable,
    mockOrders,
    mockPendingOrders,
    mockPendingOrdersInTable,
    mockReturnedOrdersInTable,
} from "testing/mockData";
import {
    makeMockApiListResponse,
    makeMockApiResponse,
    makeStoreWithEntities,
    waitFor,
} from "testing/utils";
import { get, patch } from "api/api";
import { displaySnackbar } from "../ui/uiSlice";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    patch: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPatch = patch as jest.MockedFunction<typeof patch>;

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);
const mockStateWithOrderState = (orderState?: Partial<OrderState>) => ({
    ...store.getState(),
    [orderReducerName]: {
        ...initialState,
        ...orderState,
    },
});

const mockState: RootState = {
    ...store.getState(),
    [orderReducerName]: initialState,
};

describe("Selectors", () => {
    const mockState = mockStateWithOrderState();

    test("orderSliceSelector returns the team store", () => {
        expect(orderSliceSelector(mockState)).toEqual(mockState[orderReducerName]);
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = mockStateWithOrderState({ isLoading: true });
        const loadingFalseState = mockStateWithOrderState({ isLoading: false });
        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("cancelOrderLoadingSelector", () => {
        const loadingTrueState = mockStateWithOrderState({ cancelOrderLoading: true });
        const loadingFalseState = mockStateWithOrderState({
            cancelOrderLoading: false,
        });
        expect(cancelOrderLoadingSelector(loadingTrueState)).toEqual(true);
        expect(cancelOrderLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("orderErrorSelector", () => {
        const errorExistsState = mockStateWithOrderState({ error: "exists" });
        const errorNullState = mockStateWithOrderState({ error: null });
        expect(orderErrorSelector(errorExistsState)).toEqual("exists");
        expect(orderErrorSelector(errorNullState)).toEqual(null);
    });

    test("order selectors", () => {
        const hasCheckedOutOrders = mockStateWithOrderState({
            checkedOutOrders: mockCheckedOutOrdersInTable,
        });
        const hasReturnedOrders = mockStateWithOrderState({
            returnedOrders: mockReturnedOrdersInTable,
        });
        expect(checkedOutOrdersSelector(hasCheckedOutOrders)).toEqual(
            mockCheckedOutOrdersInTable
        );
        expect(checkedOutOrdersSelector(hasReturnedOrders)).toEqual([]);
        expect(returnedOrdersSelector(hasCheckedOutOrders)).toEqual([]);
        expect(returnedOrdersSelector(hasReturnedOrders)).toEqual(
            mockReturnedOrdersInTable
        );
    });

    test("pending orders selector", () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        expect(pendingOrderSelectors.selectIds(store.getState())).toEqual(
            mockPendingOrdersInTable.map(({ id }) => id)
        );
    });

    test("hardwareInOrdersSelector", () => {
        const hasHardwareInOrders = mockStateWithOrderState({
            hardwareInOrders: [1, 2, 3],
        });
        expect(hardwareInOrdersSelector(hasHardwareInOrders)).toEqual([1, 2, 3]);
    });
});

describe("getTeamOrders Thunk", () => {
    it("Updates the store on API success", async () => {
        const response = makeMockApiListResponse(mockOrders);
        mockedGet.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(getTeamOrders());

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/team/orders/");
            expect(pendingOrderSelectors.selectAll(store.getState())).toEqual(
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
        await store.dispatch(getTeamOrders());

        expect(store.getState()[orderReducerName]).toHaveProperty(
            "error",
            failureResponse.response.message
        );
    });
});

describe("cancelOrderThunk Thunk", () => {
    it("Updates the store on API success", async () => {
        const response = makeMockApiResponse(mockPendingOrders);
        mockedPatch.mockResolvedValueOnce(response);

        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        store.dispatch(cancelOrderThunk(3));
        await waitFor(() => {
            expect(mockedPatch).toHaveBeenCalledWith(`/api/hardware/orders/${3}`, {
                status: "Cancelled",
            });
            expect(pendingOrderSelectors.selectById(store.getState(), 3)).toEqual({
                id: 3,
                items: [
                    {
                        id: 6,
                        hardware_id: 3,
                        part_returned_health: null,
                    },
                    {
                        id: 7,
                        hardware_id: 4,
                        part_returned_health: null,
                    },
                ],
                team_id: 2,
                team_code: "IEEE",
                status: "Cancelled",
                created_at: "2021-10-17T18:28:44.691969-04:00",
                updated_at: "2021-12-03T23:01:46.606892-05:00",
                request: [
                    {
                        id: 3,
                        requested_quantity: 1,
                    },
                    {
                        id: 4,
                        requested_quantity: 1,
                    },
                ],
            });
        });
    });

    it("Updates the store on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message:
                    "There was a problem cancelling orders. If this continues please contact hackathon organizers.",
            },
        };

        mockedPatch.mockRejectedValue(failureResponse);

        const store = mockStore(mockState);
        await store.dispatch(cancelOrderThunk(5));
        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message:
                    "There was a problem cancelling orders. If this continues please contact hackathon organizers.",
                options: { variant: "error" },
            })
        );
    });
});
