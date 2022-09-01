import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { get } from "api/api";
import { APIListResponse, Team } from "api/types";
import { Search } from "history";
import { AppDispatch, RootState } from "slices/store";
import { displaySnackbar } from "slices/ui/uiSlice";

interface TeamAdminExtraState {
    errorState: string | null;
    isMoreLoading: boolean;
    isLoading: boolean;
}

interface RejectValue {
    status: number;
    message: any;
}

const extraState: TeamAdminExtraState = {
    errorState: null,
    isLoading: false,
    isMoreLoading: false,
};

export const NUM_TEAM_LIMIT = 24;

export const teamAdminReducerName = "adminTeam";
const teamAdminAdapter = createEntityAdapter<Team>();
export const initialState = teamAdminAdapter.getInitialState(extraState);

// Thunks

export const getTeamsWithSearchThunk = createAsyncThunk<
    APIListResponse<Team>,
    string | undefined,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamAdminReducerName}/getTeamsWithSearchThunk`,
    async (search, { dispatch, rejectWithValue }) => {
        try {
            console.log("Search used:" + search);
            const response = await get<APIListResponse<Team>>("/api/event/teams/", {
                limit: NUM_TEAM_LIMIT,
                search,
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
            teamAdminAdapter.setAll(state, payload.results);
        });

        builder.addCase(getTeamsWithSearchThunk.rejected, (state, { payload }) => {
            state.isLoading = false;
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
