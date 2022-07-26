import store, { makeStore, RootState } from "slices/store";
import {
    mockCheckedOutOrdersInTable,
    mockOrders,
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
    teamOrderAdapterSelectors,
    hardwareInOrdersSelector,
} from "./teamOrderSlice";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    patch: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPatch = patch as jest.MockedFunction<typeof patch>;

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);
const mockStateWithTeamOrderState = (teamOrderState?: Partial<OrderState>) => ({
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

describe("Selectors", () => {
    const mockState = mockStateWithTeamOrderState();

    test("orderSliceSelector returns the team order store", () => {
        expect(teamOrderSliceSelector(mockState)).toEqual(
            mockState[teamOrderReducerName]
        );
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = mockStateWithTeamOrderState({ isLoading: true });
        const loadingFalseState = mockStateWithTeamOrderState({ isLoading: false });
        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("orderErrorSelector", () => {
        const errorExistsState = mockStateWithTeamOrderState({ error: "exists" });
        const errorNullState = mockStateWithTeamOrderState({ error: null });
        expect(errorSelector(errorExistsState)).toEqual("exists");
        expect(errorSelector(errorNullState)).toEqual(null);
    });

    // TODO
    test("orders selector", () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        expect(teamOrderAdapterSelectors.selectIds(store.getState())).toEqual(
            mockPendingOrdersInTable.map(({ id }) => id)
        );
    });

    test("hardwareInOrdersSelector", () => {
        const hasHardwareInOrders = mockStateWithTeamOrderState({
            hardwareInOrders: [1, 2, 3],
        });
        expect(hardwareInOrdersSelector(hasHardwareInOrders)).toEqual([1, 2, 3]);
    });
});

// TODO
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
