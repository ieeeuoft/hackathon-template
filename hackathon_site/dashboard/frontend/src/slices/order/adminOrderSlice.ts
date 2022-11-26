import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { APIListResponse, Order } from "api/types";
import { AppDispatch, RootState } from "slices/store";
import { get } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

interface adminOrderExtraState {
    isLoading: boolean;
    error: null | string;
}

const extraState: adminOrderExtraState = {
    isLoading: false,
    error: null,
};

const adminOrderAdapter = createEntityAdapter<Order>();

export const adminOrderReducerName = "adminOrder";
export const initialState = adminOrderAdapter.getInitialState(extraState);
export type AdminOrderState = typeof initialState;

interface RejectValue {
    status: number;
    message: any;
}

export const getOrdersWithFilters = createAsyncThunk<
    APIListResponse<Order>,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${adminOrderReducerName}/getAdminTeamOrders`,
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await get<APIListResponse<Order>>("/api/hardware/orders/");
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: e.response.message,
                    options: {
                        variant: "error",
                    },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message: e.response.message ?? e.response.data,
            });
        }
    }
);

const adminOrderSlice = createSlice({
    name: adminOrderReducerName,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getOrdersWithFilters.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getOrdersWithFilters.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            // const { pendingOrders, checkedOutOrders } = teamOrderListSerialization(
            //     payload.results
            // );
            adminOrderAdapter.setAll(state, payload.results);
        });
        builder.addCase(getOrdersWithFilters.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error =
                payload?.message ?? "There was a problem in retrieving all the orders";
        });
    },
});

export const { actions, reducer } = adminOrderSlice;
export default reducer;

// Selectors go here
export const adminOrderSliceSelector = (state: RootState) =>
    state[adminOrderReducerName];

export const adminOrderSelectors = adminOrderAdapter.getSelectors(
    adminOrderSliceSelector
);

export const isLoadingSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.isLoading
);

export const errorSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.error
);
