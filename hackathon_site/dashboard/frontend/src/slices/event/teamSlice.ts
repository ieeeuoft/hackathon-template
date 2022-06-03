import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "slices/store";
import { Team } from "api/types";
import { get } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

interface TeamExtraState {
    isLoading: boolean;
    error: string | null;
    team: Team | null;
}

export const initialState: TeamExtraState = {
    isLoading: false,
    error: null,
    team: null,
};

export const teamReducerName = "participantTeam";
export type TeamState = typeof initialState;

// Thunks
interface RejectValue {
    status: number;
    message: any;
}

export const getCurrentTeam = createAsyncThunk<
    Team,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(`${teamReducerName}/getCurrentTeam`, async (arg, { dispatch, rejectWithValue }) => {
    try {
        const response = await get<Team>("/api/event/teams/team/");
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
});

// Slice
const teamSlice = createSlice({
    name: teamReducerName,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getCurrentTeam.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });

        builder.addCase(
            getCurrentTeam.fulfilled,
            (state, { payload }: PayloadAction<Team>) => {
                if (payload) {
                    state.isLoading = false;
                    state.error = null;
                    state.team = payload;
                }
            }
        );

        builder.addCase(getCurrentTeam.rejected, (state, { payload }) => {
            state.error = payload?.message || "Something went wrong";
        });
    },
});

export const { actions, reducer } = teamSlice;
export default reducer;

// Selectors
export const teamSliceSelector = (state: RootState) => state[teamReducerName];

export const isLoadingSelector = createSelector(
    [teamSliceSelector],
    (teamSlice) => teamSlice.isLoading
);

export const teamSelector = createSelector(
    [teamSliceSelector],
    (teamSlice) => teamSlice.team
);

export const teamCodeSelector = createSelector([teamSliceSelector], (teamSlice) =>
    teamSlice.team ? teamSlice.team.team_code : null
);

export const teamMemberNamesSelector = createSelector(
    [teamSliceSelector],
    (currentTeam) =>
        currentTeam.team?.profiles.flatMap(
            (member) => member.user.first_name + " " + member.user.last_name
        )
);

export const teamSizeSelector = createSelector(
    [teamSliceSelector],
    (teamSlice) => teamSlice.team?.profiles?.length ?? 0
);
