import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "slices/store";
import { displaySnackbar } from "slices/ui/uiSlice";
import { get } from "../../api/api";
import { Team } from "../../api/types";

const teamDetailAdapter = createEntityAdapter();

const simpleState = {
    isLoading: false,
    error: null,
};

export const teamDetailReducerName = "teamDetail";

const initialState = teamDetailAdapter.getInitialState(simpleState);

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
            dispatch(
                displaySnackbar({
                    message: e.message,
                    options: {
                        variant: "error",
                    },
                })
            );
            return rejectWithValue({
                status: 500,
                message: "error",
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
            // while the api is being called
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getTeamInfoData.fulfilled, (state, { payload }) => {
            // when the api call completes
            state.isLoading = false;
            state.error = null;

            teamDetailAdapter.setMany(state, payload.profiles);
        });
        builder.addCase(getTeamInfoData.rejected, (state, { payload }) => {
            // when the api call fails
            state.isLoading = false;
            state.error = payload?.message ?? "something went wrong";
        });
    },
});

const { actions, reducer } = teamDetailSlice;
export default reducer;

// Selectors
const teamDetailSliceSelector = (state: RootState) => state[teamDetailReducerName];

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
