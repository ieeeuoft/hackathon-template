import store, { makeStore, RootState } from "slices/store";
import {
    teamReducerName,
    teamSliceSelector,
    isLoadingSelector,
    initialState,
    getCurrentTeam,
    teamSelector,
    teamCodeSelector,
    teamMemberNamesSelector,
    teamSizeSelector,
} from "slices/event/teamSlice";
import { waitFor } from "testing/utils";
import { mockTeam } from "testing/mockData";
import { get } from "api/api";
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

    test("isLoading Selector", () => {
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

    test("teamSelector returns the team", () => {
        const teamState = {
            ...mockState,
            [teamReducerName]: {
                ...initialState,
                isLoading: false,
                team: mockTeam,
            },
        };
        expect(teamSelector(teamState)).toEqual(mockTeam);
    });

    test("teamCodeSelector returns the team code", () => {
        const teamState = {
            ...mockState,
            [teamReducerName]: {
                ...initialState,
                isLoading: false,
                team: mockTeam,
            },
        };
        expect(teamCodeSelector(teamState)).toEqual(mockTeam.team_code);
    });

    test("teamSizeSelector returns the team size", () => {
        const teamState = {
            ...mockState,
            [teamReducerName]: {
                ...initialState,
                isLoading: false,
                team: mockTeam,
            },
        };
        expect(teamSizeSelector(teamState)).toEqual(mockTeam.profiles.length);
    });

    test("teamMemberNamesSelector returns the member names", () => {
        const teamState = {
            ...mockState,
            [teamReducerName]: {
                ...initialState,
                isLoading: false,
                team: mockTeam,
            },
        };
        expect(teamMemberNamesSelector(teamState)).toEqual(
            mockTeam?.profiles.flatMap(
                (member) => member.user.first_name + " " + member.user.last_name
            )
        );
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
            expect(store.getState()[teamReducerName].team).toEqual(mockTeam);
        });
    });
});
