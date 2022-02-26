import store, { makeStore, RootState } from "slices/store";
import {
    teamReducerName,
    teamSelectors,
    teamSliceSelector,
    isLoadingSelector,
    initialState,
    getCurrentTeam,
} from "slices/event/teamSlice";
import { makeMockApiListResponse, makeStoreWithEntities, waitFor } from "testing/utils";
import { mockHardware, mockTeam } from "testing/mockData";
import { get } from "../../api/api";
import { AxiosResponse } from "axios";
import { Team } from "api/types";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const mockState: RootState = {
    ...store.getState(),
    [teamReducerName]: initialState,
};

describe("Selectors", () => {
    test("teamSliceSelector returns the team store", () => {
        expect(teamSliceSelector(mockState)).toEqual(mockState[teamReducerName]);
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [teamReducerName]: {
                ...initialState,
                isLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [teamReducerName]: {
                ...initialState,
                isLoading: false,
            },
        };
        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });
});

describe("getCurrentTeam action", () => {
    test("get the detail info about the current logged in team", async () => {
        const response = { data: mockTeam } as AxiosResponse<Team>;
        mockedGet.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(getCurrentTeam());
        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/team/");
            expect(teamSelectors.selectById(store.getState(), 1)).toEqual(mockTeam);
        });
    });
});
