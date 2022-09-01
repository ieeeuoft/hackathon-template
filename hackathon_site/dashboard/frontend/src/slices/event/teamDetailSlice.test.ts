import store, { makeStore, RootState } from "slices/store";
import {
    getTeamInfoData,
    initialState,
    isParticipantIdLoadingSelector,
    isTeamInfoLoadingSelector,
    teamDetailAdapterSelector,
    teamDetailReducerName,
    teamDetailSliceSelector,
    teamInfoErrorSelector,
    updateParticipantIdErrorSelector,
    updateParticipantIdProvided,
} from "slices/event/teamDetailSlice";

import { get, patch } from "api/api";
import { makeMockApiResponse, makeStoreWithEntities, waitFor } from "testing/utils";
import { mockTeam, mockProfile } from "testing/mockData";
import { useSelector } from "react-redux";
import { displaySnackbar } from "slices/ui/uiSlice";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    patch: jest.fn(),
}));

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPatch = patch as jest.MockedFunction<typeof patch>;

const mockState: RootState = {
    ...store.getState(),
    [teamDetailReducerName]: initialState,
};

const teamFailureResponse = {
    response: {
        status: 404,
        statusText: "Not Found",
        message: "Could not find team code: Error 404",
    },
};

const profileFailureResponse = {
    response: {
        status: 404,
        statusText: "Not Found",
        message: "Could not update participant id status: Error 404",
    },
};

describe("Selectors", () => {
    test("teamDetailSliceSelector returns teamDetailSlice", () => {
        expect(teamDetailSliceSelector(mockState)).toEqual(
            mockState[teamDetailReducerName]
        );
    });

    test("isTeamInfoLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [teamDetailReducerName]: {
                ...initialState,
                isTeamInfoLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [teamDetailReducerName]: {
                ...initialState,
                isTeamInfoLoading: false,
            },
        };

        expect(isTeamInfoLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isTeamInfoLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("isParticipantIdLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [teamDetailReducerName]: {
                ...initialState,
                isParticipantIdLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [teamDetailReducerName]: {
                ...initialState,
                isParticipantIdLoading: false,
            },
        };

        expect(isParticipantIdLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isParticipantIdLoadingSelector(loadingFalseState)).toEqual(false);
    });
});

describe("getTeamInfoData thunk", () => {
    it("Updates the store on API success", async () => {
        const mockResponse = makeMockApiResponse(mockTeam);
        mockedGet.mockResolvedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData(mockTeam.team_code));

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith(
                `/api/event/teams/${mockTeam.team_code}/`
            );
            expect(teamInfoErrorSelector(store.getState())).toBeFalsy();
            expect(teamDetailAdapterSelector.selectAll(store.getState())).toEqual(
                mockTeam.profiles
            );
        });
    });

    it("Dispatches snackbar on API failure", async () => {
        mockedGet.mockRejectedValueOnce(teamFailureResponse);

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
        mockedGet.mockRejectedValueOnce(teamFailureResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData("abc"));

        expect(teamInfoErrorSelector(store.getState())).toBe(
            "Could not find team code: Error 404"
        );
    });
});

describe("updateParticipantIdProvided thunk", () => {
    it("Updates the store on API success", async () => {
        // populate store
        let mockResponse = makeMockApiResponse(mockTeam);
        mockedGet.mockResolvedValueOnce(mockResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData(mockTeam.team_code));

        // change one profile in store
        const mockProfileResponse = { ...mockProfile };
        mockProfileResponse.id_provided = true;
        mockResponse = makeMockApiResponse(mockProfileResponse);
        mockedPatch.mockResolvedValueOnce(mockResponse);

        await store.dispatch(
            updateParticipantIdProvided({
                profileId: mockProfile.id,
                idProvided: !mockProfile.id_provided,
            })
        );

        // expect id_provided for that profile to have been changed in the store
        await waitFor(() => {
            expect(mockedPatch).toHaveBeenCalledWith(
                `/api/event/profiles/${mockProfile.id}/`,
                {
                    id_provided: !mockProfile.id_provided,
                }
            );
            expect(updateParticipantIdErrorSelector(store.getState())).toBeFalsy();
            expect(
                teamDetailAdapterSelector.selectById(store.getState(), mockProfile.id)
                    ?.id_provided
            ).toEqual(!mockProfile.id_provided);
        });
    });
    it("Dispatches snackbar on API failure", async () => {
        mockedPatch.mockRejectedValueOnce(profileFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(
            updateParticipantIdProvided({
                profileId: mockProfile.id,
                idProvided: !mockProfile.id_provided,
            })
        );

        expect(mockedPatch).toHaveBeenCalledWith(
            `/api/event/profiles/${mockProfile.id}/`,
            {
                id_provided: !mockProfile.id_provided,
            }
        );

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Could not update participant id status: Error 404",
                options: { variant: "error" },
            })
        );
    });
});
