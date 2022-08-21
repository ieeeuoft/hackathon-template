import store, { makeStore, RootState } from "slices/store";
import {
    errorSelector,
    getTeamInfoData,
    initialState,
    isLoadingSelector,
    teamDetailAdapterSelector,
    teamDetailReducerName,
    teamDetailSliceSelector,
} from "slices/event/teamDetailSlice";

import { get } from "api/api";
import { makeMockApiResponse, makeStoreWithEntities, waitFor } from "testing/utils";
import { mockTeam } from "testing/mockData";
import { useSelector } from "react-redux";
import { displaySnackbar } from "slices/ui/uiSlice";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

const mockedGet = get as jest.MockedFunction<typeof get>;

const mockState: RootState = {
    ...store.getState(),
    [teamDetailReducerName]: initialState,
};

const failureResponse = {
    response: {
        status: 404,
        statusText: "Not Found",
        message: "Could not find team code: Error 404",
    },
};

describe("Selectors", () => {
    test("teamDetailSliceSelector returns teamDetailSlice", () => {
        expect(teamDetailSliceSelector(mockState)).toEqual(
            mockState[teamDetailReducerName]
        );
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [teamDetailReducerName]: {
                ...initialState,
                isLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [teamDetailReducerName]: {
                ...initialState,
                isLoading: false,
            },
        };

        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });
});

describe("getTeamInfoData thunk", () => {
    it("Updates the store on API success", async () => {
        const mockResponse = makeMockApiResponse(mockTeam);
        mockedGet.mockResolvedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData("1"));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/1/");
            expect(errorSelector(store.getState())).toBeFalsy();
            expect(teamDetailAdapterSelector.selectAll(store.getState())).toEqual(
                mockTeam.profiles
            );
        });
    });

    it("Dispatches snackbar on API failure", async () => {
        mockedGet.mockRejectedValueOnce(failureResponse);

        const store = mockStore(mockState);
        await store.dispatch(getTeamInfoData("abc"));

        expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/abc/");

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Could not find team code: Error 404",
                options: { variant: "error" },
            })
        );
    });

    it("Updates error state on API failure", async () => {
        mockedGet.mockRejectedValueOnce(failureResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData("abc"));

        expect(errorSelector(store.getState())).toBe(
            "Could not find team code: Error 404"
        );
    });
});
