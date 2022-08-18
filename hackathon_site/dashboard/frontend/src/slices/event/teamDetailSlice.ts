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
    isLoading: boolean;
    error: string | null;
}

const extraState: TeamDetailExtraState = {
    isLoading: false,
    error: null,
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
    attended: boolean;
}

export const updateParticipantIdProvided = createAsyncThunk<
    Profile,
    idProvidedParameters,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamDetailReducerName}/updateParticipantIdProvided`,
    async ({ profileId, idProvided, attended }, { rejectWithValue, dispatch }) => {
        try {
            const response = await patch<Profile>(`/api/event/profiles/${profileId}/`, {
                id_provided: !idProvided,
                attended: attended,
            });
            return response.data;
        } catch (e: any) {
            const message =
                e.response.statusText === "Not Found"
                    ? `Could not find participant: Error ${e.response.status}`
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
    async (teamId, { rejectWithValue, dispatch }) => {
        try {
            const response = await get<Team>(`/api/event/teams/${teamId}/`);
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
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getTeamInfoData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;

            teamDetailAdapter.setMany(state, payload.profiles);
        });
        builder.addCase(getTeamInfoData.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error = payload?.message ?? "Something went wrong";
        });
        builder.addCase(updateParticipantIdProvided.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateParticipantIdProvided.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;

            const updateObject = {
                id: payload.id,
                changes: {
                    id_provided: payload.id_provided,
                },
            };
            teamDetailAdapter.updateOne(state, updateObject);
        });
        builder.addCase(updateParticipantIdProvided.rejected, (state, { payload }) => {
            state.isLoading = true;
            state.error = payload?.message ?? "Something went wrong";
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
export const isLoadingSelector = createSelector(
    [teamDetailSliceSelector],
    (teamDetailSlice) => teamDetailSlice.isLoading
);

export const errorSelector = createSelector(
    [teamDetailSliceSelector],
    (teamDetailSlice) => teamDetailSlice.error
);
