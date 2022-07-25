import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "slices/store";
import { get } from "../../api/api";
import { APIListResponse, Team } from "../../api/types";

const teamOrderAdaptor = createEntityAdapter();

const simpleState = {
    isLoading: false,
    error: null,
};

export const teamDetailReducerName = "teamDetail";

const initialState = teamOrderAdaptor.getInitialState(simpleState);

export const getTeamInfoData = createAsyncThunk<
    Team | undefined,
    { teamCode: string },
    {}
>(`${teamDetailReducerName}/getTeamInfoData`, async (teamCode, {}) => {
    try {
        const response = await get<Team>(`/api/event/teams/ABCDE`);
        console.log(response.data);
        return response.data;
    } catch (e: any) {
        console.log(e);
    }
});

const teamDetailSlice = createSlice({
    name: teamDetailReducerName,
    initialState,
    reducers: {
        setIsLoading: (state, props) => {
            state.isLoading = !state.isLoading;
            console.log(state, props);
        },
        addTeamOrder: (state, { payload }) => {
            teamOrderAdaptor.addOne(state, payload);
        },
    },
});

const { actions, reducer } = teamDetailSlice;
export default reducer;
// destructuring actions
export const { setIsLoading } = actions;
export const { addTeamOrder } = actions;

// Selectors
const teamDetailSliceSelector = (state: RootState) => state[teamDetailReducerName];

export const teamOrderAdaptorSelector = teamOrderAdaptor.getSelectors(
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
