import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "slices/store";
import { displaySnackbar } from "slices/ui/uiSlice";
import { get } from "api/api";
import { ProfileWithUser, Team, User, UserWithoutProfile } from "api/types";

const extraState = {
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
