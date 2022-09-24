import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { OrderStatus } from "api/types";
import { AppDispatch, RootState } from "slices/store";
import { get, post, patch } from "api/api";
import { APIListResponse, Order, OrderInTable, ReturnOrderInTable } from "api/types";
import { displaySnackbar } from "slices/ui/uiSlice";
import { teamOrderListSerialization } from "api/helpers";

interface TeamOrderExtraState {
    isLoading: boolean;
    error: null | string;
    hardwareIdsToFetch: number[] | null;
    returnedOrders: ReturnOrderInTable[];
    returnedIsLoading: boolean;
}

export interface UpdateOrderAttributes {
    id: number;
    status: OrderStatus;
}

const extraState: TeamOrderExtraState = {
    isLoading: false,
    error: null,
    hardwareIdsToFetch: null,
    returnedOrders: [],
    returnedIsLoading: false,
};

const teamOrders = createEntityAdapter<OrderInTable>();

export const teamOrderReducerName = "teamOrder";
export const initialState = teamOrders.getInitialState(extraState);
export type TeamOrderState = typeof initialState;

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

export interface ReturnOrderRequest {
    hardware: {
        id: number;
        quantity: number;
        part_returned_health: string;
    }[];
    order: number;
}

export interface ReturnOrderResponse {
    order_id: number;
    team_code: string;
    returned_items: {
        hardware_id: number;
        quantity: number;
    }[];
    errors: {
        hardware_id: number;
        message: string;
    }[];
}

export const returnItems = createAsyncThunk<
    ReturnOrderResponse,
    ReturnOrderRequest,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamOrderReducerName}/returnItems`,
    async (returnItemsData, { rejectWithValue, dispatch }) => {
        try {
            const response = await post<ReturnOrderResponse>(
                `/api/hardware/orders/returns/`,
                returnItemsData
            );
            dispatch(
                displaySnackbar({
                    message: `Order ${response.data.order_id} has been returned.`,
                    options: {
                        variant: "success",
                    },
                })
            );
            dispatch(getAdminTeamOrders(response.data.team_code));
            return response.data;
        } catch (e: any) {
            const message =
                e.response.statusText === "Not Found"
                    ? `Could not return order: Error ${e.response.status}`
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
                message: e.response.message ?? e.response.data,
            });
        }
    }
);

export const updateOrderStatus = createAsyncThunk<
    Order,
    UpdateOrderAttributes,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${teamOrderReducerName}/updateOrderStatus`,
    async (updateOrderData, { rejectWithValue, dispatch }) => {
        const { id, ...patchData } = updateOrderData;
        try {
            const response = await patch<Order>(
                `/api/hardware/orders/${id}/`,
                patchData
            );
            dispatch(
                displaySnackbar({
                    message: `Order status has been changed.`,
                    options: {
                        variant: "success",
                    },
                })
            );
            return response.data;
        } catch (e: any) {
            const message =
                e.response.statusText === "Not Found"
                    ? `Could not update order status: Error ${e.response.status}`
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
                message: e.response.message ?? e.response.data,
            });
        }
    }
);

const teamOrderSlice = createSlice({
    name: teamOrderReducerName,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAdminTeamOrders.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getAdminTeamOrders.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            const {
                pendingOrders,
                checkedOutOrders,
                returnedOrders,
                hardwareIdsToFetch,
            } = teamOrderListSerialization(payload.results);
            teamOrders.setAll(state, [...pendingOrders, ...checkedOutOrders]);
            state.returnedOrders = returnedOrders;
            state.hardwareIdsToFetch = hardwareIdsToFetch;
        });
        builder.addCase(getAdminTeamOrders.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error =
                payload?.message ??
                "There was a problem retrieving orders. If this continues please contact hackathon organizers.";
        });
        builder.addCase(returnItems.pending, (state) => {
            state.returnedIsLoading = true;
        });
        builder.addCase(returnItems.fulfilled, (state, { payload }) => {
            state.returnedIsLoading = false;
        });
        builder.addCase(returnItems.rejected, (state, { payload }) => {
            state.returnedIsLoading = false;
        });

        builder.addCase(updateOrderStatus.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            const updateObject = {
                id: payload.id,
                changes: {
                    status: payload.status,
                },
            };
            teamOrders.updateOne(state, updateObject);
        });
        builder.addCase(updateOrderStatus.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error =
                payload?.message ??
                "There was a problem retrieving orders. If this continues please contact hackathon organizers.";
        });
    },
});

export const { actions, reducer } = teamOrderSlice;
export default reducer;

// Selectors
export const teamOrderSliceSelector = (state: RootState) => state[teamOrderReducerName];

export const teamOrderSelectors = teamOrders.getSelectors(teamOrderSliceSelector);

export const isLoadingSelector = createSelector(
    [teamOrderSliceSelector],
    (teamOrderSlice) => teamOrderSlice.isLoading
);

export const errorSelector = createSelector(
    [teamOrderSliceSelector],
    (teamOrderSlice) => teamOrderSlice.error
);

export const isReturnedLoadingSelector = createSelector(
    [teamOrderSliceSelector],
    (teamOrderSlice) => teamOrderSlice.returnedIsLoading
);

export const hardwareInOrdersSelector = createSelector(
    [teamOrderSliceSelector],
    (teamOrderSlice) => teamOrderSlice.hardwareIdsToFetch
);

export const pendingOrdersSelector = createSelector(
    [teamOrderSelectors.selectAll, teamOrderSliceSelector],
    (orders) =>
        orders.filter(
            (order) =>
                order.status === "Submitted" || order.status === "Ready for Pickup"
        )
);

export const checkedOutOrdersSelector = createSelector(
    [teamOrderSelectors.selectAll, teamOrderSliceSelector],
    (orders) => orders.filter((order) => order.status === "Picked Up")
);

export const returnedOrdersSelector = createSelector(
    [teamOrderSliceSelector],
    (teamOrderSlice) => teamOrderSlice.returnedOrders
);
