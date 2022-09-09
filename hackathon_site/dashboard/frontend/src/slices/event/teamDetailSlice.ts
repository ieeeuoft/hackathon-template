import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "slices/store";
import { displaySnackbar } from "slices/ui/uiSlice";
import { get, patch } from "api/api";
import { Profile, ProfileWithUser, Team } from "api/types";

interface TeamDetailExtraState {
    isTeamInfoLoading: boolean;
    isParticipantIdLoading: boolean;
    teamInfoError: string | null;
    participantIdError: string | null;
}

const extraState: TeamDetailExtraState = {
    isTeamInfoLoading: false,
    isParticipantIdLoading: false,
    teamInfoError: null,
    participantIdError: null,
};

const teamDetailAdapter = createEntityAdapter<ProfileWithUser>();

export const teamDetailReducerName = "teamDetail";

export const initialState = teamDetailAdapter.getInitialState(extraState);

interface RejectValue {
    status: number;
    message: any;
}

interface idProvidedParameters {
    profileId: number;
    idProvided: boolean;
}

export const updateParticipantIdProvided = createAsyncThunk<
    Profile,
    idProvidedParameters,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamDetailReducerName}/updateParticipantIdProvided`,
    async ({ profileId, idProvided }, { rejectWithValue, dispatch }) => {
        try {
            const response = await patch<Profile>(`/api/event/profiles/${profileId}/`, {
                id_provided: idProvided,
            });
            return response.data;
        } catch (e: any) {
            const message =
                e.response.statusText === "Not Found"
                    ? `Could not update participant id status: Error ${e.response.status}`
                    : `Something went wrong: Error ${e.response.status}`;
            dispatch(
                displaySnackbar({
                    message,
                    options: {
                        variant: "error",
                    },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message,
            });
        }
    }
);

export const getTeamInfoData = createAsyncThunk<
    Team,
    string,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamDetailReducerName}/getTeamInfoData`,
    async (teamCode, { rejectWithValue, dispatch }) => {
        try {
            const response = await get<Team>(`/api/event/teams/${teamCode}/`);
            return response.data;
        } catch (e: any) {
            const message =
                e.response.statusText === "Not Found"
                    ? `Could not find team code: Error ${e.response.status}`
                    : `Something went wrong: Error ${e.response.status}`;
            dispatch(
                displaySnackbar({
                    message,
                    options: {
                        variant: "error",
                    },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message,
            });
        }
    }
);

const teamDetailSlice = createSlice({
    name: teamDetailReducerName,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getTeamInfoData.pending, (state) => {
            state.isTeamInfoLoading = true;
            state.teamInfoError = null;
        });
        builder.addCase(getTeamInfoData.fulfilled, (state, { payload }) => {
            state.isTeamInfoLoading = false;
            state.teamInfoError = null;

            teamDetailAdapter.setAll(state, payload.profiles);
        });
        builder.addCase(getTeamInfoData.rejected, (state, { payload }) => {
            state.isTeamInfoLoading = false;
            state.teamInfoError = payload?.message ?? "Something went wrong";
        });
        builder.addCase(updateParticipantIdProvided.pending, (state) => {
            state.isParticipantIdLoading = true;
            state.participantIdError = null;
        });
        builder.addCase(updateParticipantIdProvided.fulfilled, (state, { payload }) => {
            state.isParticipantIdLoading = false;
            state.participantIdError = null;

            const updateObject = {
                id: payload.id,
                changes: {
                    id_provided: payload.id_provided,
                },
            };
            teamDetailAdapter.updateOne(state, updateObject);
        });
        builder.addCase(updateParticipantIdProvided.rejected, (state, { payload }) => {
            state.isParticipantIdLoading = false;
            state.participantIdError = payload?.message ?? "Something went wrong";
        });
    },
});

const { reducer } = teamDetailSlice;
export default reducer;

// Selectors
export const teamDetailSliceSelector = (state: RootState) =>
    state[teamDetailReducerName];

export const teamDetailAdapterSelector = teamDetailAdapter.getSelectors(
    teamDetailSliceSelector
);
export const isTeamInfoLoadingSelector = createSelector(
    [teamDetailSliceSelector],
    (teamDetailSlice) => teamDetailSlice.isTeamInfoLoading
);

export const isParticipantIdLoadingSelector = createSelector(
    [teamDetailSliceSelector],
    (teamDetailSlice) => teamDetailSlice.isParticipantIdLoading
);

export const teamInfoErrorSelector = createSelector(
    [teamDetailSliceSelector],
    (teamDetailSlice) => teamDetailSlice.teamInfoError
);

export const updateParticipantIdErrorSelector = createSelector(
    [teamDetailSliceSelector],
    (teamDetailSlice) => teamDetailSlice.participantIdError
);
