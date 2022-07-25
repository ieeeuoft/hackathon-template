import store, { makeStore, RootState } from "../store";
import {
    teamAdminReducerName,
    initialState,
    teamAdminSliceSelector,
    isLoadingSelector,
    getAllTeams,
    teamAdminSelectors,
} from "./teamAdminSlice";
import { makeMockApiListResponse, waitFor } from "../../testing/utils";
import { mockTeams } from "../../testing/mockData";
import { get } from "../../api/api";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const mockState: RootState = {
    ...store.getState(),
    [teamAdminReducerName]: initialState,
};

describe("Selectors", () => {
    test("teamAdminSliceSelector returns the isLoading state", () => {
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
    it("Updates the store on API success", async () => {
        const mockResponse = makeMockApiListResponse(mockTeams);
        mockedGet.mockResolvedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getAllTeams());

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/", { limit: 24 });
            expect(teamAdminSelectors.selectAll(store.getState())).toEqual(mockTeams);
        });
    });
});
