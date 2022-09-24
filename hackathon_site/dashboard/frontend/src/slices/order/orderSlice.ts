import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { APIListResponse, Order, OrderInTable, ReturnOrderInTable } from "api/types";
import { AppDispatch, RootState } from "slices/store";
import { get, patch } from "api/api";
import { teamOrderListSerialization } from "api/helpers";
import { displaySnackbar } from "slices/ui/uiSlice";

interface OrderExtraState {
    isLoading: boolean;
    cancelOrderLoading: boolean;
    error: string | null;
    next: string | null;
    hardwareInOrders: number[] | null;
    returnedOrders: ReturnOrderInTable[];
    checkedOutOrders: OrderInTable[];
}

const extraState: OrderExtraState = {
    isLoading: false,
    cancelOrderLoading: false,
    error: null,
    next: null,
    hardwareInOrders: null,
    returnedOrders: [],
    checkedOutOrders: [],
};

const pendingOrderAdapter = createEntityAdapter<OrderInTable>();

export const orderReducerName = "participantOrder";
export const initialState = pendingOrderAdapter.getInitialState(extraState);
export type OrderState = typeof initialState;

interface RejectValue {
    status: number;
    message: any;
}

export const getTeamOrders = createAsyncThunk<
    APIListResponse<Order>,
    undefined,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(`${orderReducerName}/getTeamOrders`, async (_, { rejectWithValue }) => {
    try {
        const response = await get<APIListResponse<Order>>(
            "/api/event/teams/team/orders/"
        );
        return response.data;
    } catch (e: any) {
        return rejectWithValue({
            status: e.response.status,
            message: e.response.message ?? e.response.data,
        });
    }
});

export const cancelOrderThunk = createAsyncThunk<
    Order,
    number,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${orderReducerName}/cancelOrderThunk`,
    async (orderId, { dispatch, rejectWithValue }) => {
        try {
            const response = await patch<Order>(
                `/api/event/teams/team/orders/${orderId}`,
                {
                    status: "Cancelled",
                }
            );
            dispatch(
                displaySnackbar({
                    message: `Order has been cancelled.`,
                    options: { variant: "success" },
                })
            );
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `Failed to cancel order: ${e.response?.data?.status[0]}`,
                    options: { variant: "error" },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message: e.response.message ?? e.response.data,
            });
        }
    }
);

const orderSlice = createSlice({
    name: orderReducerName,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getTeamOrders.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });

        builder.addCase(getTeamOrders.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            state.next = payload.next;
            const {
                pendingOrders,
                checkedOutOrders,
                returnedOrders,
                hardwareIdsToFetch,
            } = teamOrderListSerialization(payload.results);

            pendingOrderAdapter.setAll(state, pendingOrders);
            state.checkedOutOrders = checkedOutOrders;
            state.returnedOrders = returnedOrders;
            state.hardwareInOrders = hardwareIdsToFetch;
        });

        builder.addCase(getTeamOrders.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error =
                payload?.message ||
                "There was a problem retrieving orders. If this continues please contact hackathon organizers.";
        });

        builder.addCase(cancelOrderThunk.pending, (state) => {
            state.cancelOrderLoading = true;
        });

        builder.addCase(cancelOrderThunk.fulfilled, (state, { payload }) => {
            state.cancelOrderLoading = false;
            if (payload) {
                pendingOrderAdapter.removeOne(state, payload.id);
            }
        });

        builder.addCase(cancelOrderThunk.rejected, (state, { payload }) => {
            state.cancelOrderLoading = false;
        });
    },
});

export const { actions, reducer } = orderSlice;
export default reducer;

// Selectors
export const orderSliceSelector = (state: RootState) => state[orderReducerName];

export const pendingOrderSelectors =
    pendingOrderAdapter.getSelectors(orderSliceSelector);

export const isLoadingSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.isLoading
);

export const orderErrorSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.error
);

export const checkedOutOrdersSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.checkedOutOrders
);

export const returnedOrdersSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.returnedOrders
);

export const hardwareInOrdersSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.hardwareInOrders
);

export const cancelOrderLoadingSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.cancelOrderLoading
);
