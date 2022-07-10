import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import { get } from "../../api/api";
import { APIListResponse, Order } from "../../api/types";
import { displaySnackbar } from "../ui/uiSlice";

const simpleState = {
    isLoading: false,
    error: null,
};

const teamOrderAdapter = createEntityAdapter();

export const teamOrderReducerName = "teamOrder";
const initialState = teamOrderAdapter.getInitialState(simpleState);

interface RejectValue {
    status: number;
    message: any;
}

export const getAdminTeamOrders = createAsyncThunk<
    APIListResponse<Order>,
    string,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamOrderReducerName}/getAdminTeamOrders`,
    async (team_code, { rejectWithValue, dispatch }) => {
        try {
            throw Error("errorrr");
            const response = await get<APIListResponse<Order>>(
                "/api/hardware/orders/",
                {
                    team_code,
                }
            );
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
                message: "oh no!",
            });
        }
    }
);

const teamOrderSlice = createSlice({
    name: teamOrderReducerName,
    initialState,
    reducers: {
        // TODO: remove later
        setIsLoading: (state, props) => {
            state.isLoading = !state.isLoading;
            console.log(state, props.payload);
        },
        addTeamOrder: (state, { payload }) => {
            teamOrderAdapter.addOne(state, payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAdminTeamOrders.pending, (state) => {
            // while the api is being called (not completed yet)
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getAdminTeamOrders.fulfilled, (state, { payload }) => {
            // when the api call completes
            state.isLoading = false;
            state.error = null;

            teamOrderAdapter.setMany(state, payload.results);
        });
        builder.addCase(getAdminTeamOrders.rejected, (state, { payload }) => {
            // error occurs
            state.error = payload?.message ?? "something went wrong :(";
        });
    },
});

export const { actions, reducer } = teamOrderSlice;
export default reducer;
// destructuring actions
export const { setIsLoading, addTeamOrder } = actions;

// Selectors
const teamOrderSliceSelector = (state: RootState) => state[teamOrderReducerName];

export const teamOrderAdapterSelector =
    teamOrderAdapter.getSelectors(teamOrderSliceSelector);

export const isLoadingSelector = createSelector(
    [teamOrderSliceSelector],
    (teamOrderSlice) => teamOrderSlice.isLoading
);
