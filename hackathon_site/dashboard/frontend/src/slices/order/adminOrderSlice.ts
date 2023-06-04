import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";
import { APIListResponse, Order, OrderFilters, OrderStatus } from "api/types";
import { AppDispatch, RootState } from "slices/store";
import { get } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

interface numStatuses {
    Submitted?: number;
    "Ready for Pickup"?: number;
    "Picked Up"?: number;
    Cancelled?: number;
    Returned?: number;
}

interface adminOrderExtraState {
    isLoading: boolean;
    error: null | string;
    filters: OrderFilters;
    needNumStatuses: boolean;
    numStatuses: numStatuses;
}

const extraState: adminOrderExtraState = {
    isLoading: false,
    error: null,
    filters: {} as OrderFilters,
    needNumStatuses: true,
    numStatuses: {},
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
    undefined,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${adminOrderReducerName}/getAdminTeamOrders`,
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const filters = adminOrderFiltersSelector(getState());
            const response = await get<APIListResponse<Order>>(
                "/api/hardware/orders/",
                filters
            );
            // Filter out orders that do not have a team_code (their teams were deleted)
            response.data.results = response.data.results.filter(
                (orders) => orders?.team_code
            );
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
    reducers: {
        setFilters: (
            state: AdminOrderState,
            { payload }: PayloadAction<OrderFilters>
        ) => {
            const { status, ordering, search } = {
                ...state.filters,
                ...payload,
            };

            // Remove values that are empty or falsy
            state.filters = {
                ...(status && { status }),
                ...(ordering && { ordering }),
                ...(search && { search }),
            };
        },

        clearFilters: (
            state: AdminOrderState,
            { payload }: PayloadAction<{ saveSearch?: boolean } | undefined>
        ) => {
            const { search } = state.filters;

            state.filters = {};

            if (payload?.saveSearch && search) {
                state.filters.search = search;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getOrdersWithFilters.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getOrdersWithFilters.fulfilled, (state, { payload, meta }) => {
            state.isLoading = false;
            state.error = null;

            function numOrdersByStatus(status: OrderStatus, orders: Order[]) {
                let count = 0;
                orders.forEach((order) => {
                    if (order.status === status) count++;
                });
                return count;
            }

            if (state.needNumStatuses) {
                state.needNumStatuses = false;
                state.numStatuses["Submitted"] = numOrdersByStatus(
                    "Submitted",
                    payload.results
                );
                state.numStatuses["Ready for Pickup"] = numOrdersByStatus(
                    "Ready for Pickup",
                    payload.results
                );
                state.numStatuses["Picked Up"] = numOrdersByStatus(
                    "Picked Up",
                    payload.results
                );
                state.numStatuses["Cancelled"] = numOrdersByStatus(
                    "Cancelled",
                    payload.results
                );
                state.numStatuses["Returned"] = numOrdersByStatus(
                    "Returned",
                    payload.results
                );
            }
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

export const adminOrderFiltersSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.filters
);

export const adminOrderNeedNumStatusesSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.needNumStatuses
);

export const adminOrderNumStatusesSelector = createSelector(
    [adminOrderSliceSelector],
    (adminOrderSlice) => adminOrderSlice.numStatuses
);

export const adminOrderTotalSelector = createSelector(
    [adminOrderSelectors.selectAll],
    (orderItems) => orderItems.reduce((accum) => accum + 1, 0)
);

export const { setFilters, clearFilters } = actions;
