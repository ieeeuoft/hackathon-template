import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { get, stripHostnameReturnFilters } from "api/api";
import { APIListResponse, Team } from "api/types";
import { AppDispatch, RootState } from "slices/store";
import { displaySnackbar } from "slices/ui/uiSlice";

interface TeamAdminExtraState {
    errorState: string | null;
    isMoreLoading: boolean;
    isLoading: boolean;
    next: string | null;
    count: number;
}

interface RejectValue {
    status: number;
    message: any;
}

const extraState: TeamAdminExtraState = {
    errorState: null,
    isLoading: false,
    isMoreLoading: false,
    next: null,
    count: 0,
};

export const NUM_TEAM_LIMIT = 24;

export const teamAdminReducerName = "adminTeam";
const teamAdminAdapter = createEntityAdapter<Team>();
export const initialState = teamAdminAdapter.getInitialState(extraState);
export type TeamAdminState = typeof initialState;

// Thunks

export const getTeamsWithSearchThunk = createAsyncThunk<
    APIListResponse<Team>,
    string | undefined,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamAdminReducerName}/getTeamsWithSearchThunk`,
    async (search, { dispatch, rejectWithValue }) => {
        try {
            const response = await get<APIListResponse<Team>>("/api/event/teams/", {
                limit: NUM_TEAM_LIMIT,
                ...(!!search && { search }),
            });
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `Failed to fetch team data: Error ${e.response.status}`,
                    options: { variant: "error" },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message: e.response.data,
            });
        }
    }
);

export const getTeamNextPage = createAsyncThunk<
    APIListResponse<Team> | null,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamAdminReducerName}/getTeamNextPage`,
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const nextFromState = teamNextSelector(getState());
            if (nextFromState) {
                const { path, filters } = stripHostnameReturnFilters(nextFromState);
                const response = await get<APIListResponse<Team>>(path, {
                    ...filters,
                    limit: NUM_TEAM_LIMIT,
                });
                return response.data;
            }
            return null;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `Failed to fetch team data: Error ${e.response.status}`,
                    options: { variant: "error" },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message: e.response.data,
            });
        }
    }
);

const teamAdminSlice = createSlice({
    name: teamAdminReducerName,
    initialState: initialState, // initialState is sufficient
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getTeamsWithSearchThunk.pending, (state) => {
            state.isLoading = true;
            state.errorState = null;
        });

        builder.addCase(getTeamsWithSearchThunk.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.errorState = null;
            state.next = payload.next;
            state.count = payload.count;
            teamAdminAdapter.setAll(state, payload.results);
        });

        builder.addCase(getTeamsWithSearchThunk.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.errorState = payload?.message || "Something went wrong";
        });

        builder.addCase(getTeamNextPage.pending, (state) => {
            state.isMoreLoading = true;
            state.errorState = null;
        });

        builder.addCase(getTeamNextPage.fulfilled, (state, { payload }) => {
            state.isMoreLoading = false;
            state.errorState = null;
            if (payload) {
                state.next = payload.next;
                state.count = payload.count;
                teamAdminAdapter.addMany(state, payload.results);
            }
        });

        builder.addCase(getTeamNextPage.rejected, (state, { payload }) => {
            state.isMoreLoading = false;
            state.errorState = payload?.message || "Something went wrong";
        });
    },
});

export const { actions, reducer } = teamAdminSlice;
export default reducer;

export const teamAdminSliceSelector = (state: RootState) => state[teamAdminReducerName];

export const teamAdminSelectors = teamAdminAdapter.getSelectors(teamAdminSliceSelector);

export const isLoadingSelector = createSelector(
    [teamAdminSliceSelector],
    (teamAdminSlice) => teamAdminSlice.isLoading
);

export const isMoreLoadingSelector = createSelector(
    [teamAdminSliceSelector],
    (teamAdminSlice) => teamAdminSlice.isMoreLoading
);

const teamNextSelector = createSelector(
    [teamAdminSliceSelector],
    (teamAdminSlice) => teamAdminSlice.next
);

export const teamCountSelector = createSelector(
    [teamAdminSliceSelector],
    (teamAdminSlice) => teamAdminSlice.count
);
