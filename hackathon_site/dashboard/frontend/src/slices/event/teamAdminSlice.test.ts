import store, { makeStore, RootState } from "slices/store";
import {
    teamAdminReducerName,
    initialState,
    teamAdminSliceSelector,
    isLoadingSelector,
    getAllTeams,
    teamAdminSelectors,
    RESPONSE_TIME,
} from "slices/event/teamAdminSlice";
import { makeMockApiListResponse, waitFor } from "testing/utils";
import { mockTeams } from "testing/mockData";
import { get, post } from "api/api";
import { cartReducerName, submitOrder } from "../hardware/cartSlice";
import { displaySnackbar } from "../ui/uiSlice";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

const mockState: RootState = {
    ...store.getState(),
    [teamAdminReducerName]: initialState,
};

describe("Selectors", () => {
    test("teamAdminSliceSelector returns teamAdminSlice", () => {
        expect(teamAdminSliceSelector(mockState)).toEqual(
            mockState[teamAdminReducerName]
        );
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [teamAdminReducerName]: {
                ...initialState,
                isLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [teamAdminReducerName]: {
                ...initialState,
                isLoading: false,
            },
        };

        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });
});

describe("getAllTeams thunk", () => {
    const apiFailureResponse = {
        response: {
            status: 500,
            message: "Something went wrong",
        },
    };

    it("Updates the store on API success", async () => {
        const mockResponse = makeMockApiListResponse(mockTeams);
        mockedGet.mockResolvedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getAllTeams());

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/", {
                limit: RESPONSE_TIME,
            });
            expect(teamAdminSelectors.selectAll(store.getState())).toEqual(mockTeams);
        });
    });

    it("Dispatches a snackbar on API failure", async () => {
        mockedGet.mockRejectedValueOnce(apiFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(getAllTeams());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Failed to fetch team data: Error 500",
                options: { variant: "error" },
            })
        );
    });
});
