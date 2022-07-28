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
import { makeMockApiResponse, waitFor } from "testing/utils";
import { mockTeam } from "testing/mockData";
import { useSelector } from "react-redux";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;

const mockState: RootState = {
    ...store.getState(),
    [teamDetailReducerName]: initialState,
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

    it("Updates error status on API failure", async () => {
        const mockResponse = makeMockApiResponse(mockTeam);
        mockedGet.mockRejectedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData("1"));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/1/");
            expect(errorSelector(store.getState())).toBeTruthy();
        });
    });
});
