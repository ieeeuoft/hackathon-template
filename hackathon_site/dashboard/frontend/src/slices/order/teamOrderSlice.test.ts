import store, { makeStore, RootState } from "slices/store";
import {
    mockCheckedOutOrdersInTable,
    mockOrders,
    mockPendingOrdersInTable,
    mockReturnedOrdersInTable,
    mockTeam,
} from "testing/mockData";
import { makeMockApiListResponse, makeStoreWithEntities, waitFor } from "testing/utils";
import { get } from "api/api";
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
} from "./teamOrderSlice";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    patch: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

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

const combinedOrders = [...mockPendingOrdersInTable, ...mockCheckedOutOrdersInTable];

describe("Selectors", () => {
    const mockState = mockStateWithTeamOrderState();

    test("teamOrderSliceSelector returns the team order store", () => {
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
