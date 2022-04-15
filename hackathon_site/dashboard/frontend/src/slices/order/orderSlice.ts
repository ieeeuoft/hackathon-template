import { createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { Order } from "api/types";
import { RootState } from "slices/store";

interface OrderExtraState {
    isLoading: boolean;
    error: string | null;
}

const extraState: OrderExtraState = {
    isLoading: false,
    error: null,
};

const orderAdapter = createEntityAdapter<Order>();

export const orderReducerName = "participantOrder";
export const initialState = orderAdapter.getInitialState(extraState);
export type OrderState = typeof initialState;

interface RejectValue {
    status: number;
    message: any;
}

const orderSlice = createSlice({
    name: orderReducerName,
    initialState,
    reducers: {},
});

export const { actions, reducer } = orderSlice;
export default reducer;

// Selectors
export const orderSliceSelector = (state: RootState) => state[orderReducerName];

export const orderSelectors = orderAdapter.getSelectors(orderSliceSelector);

export const isLoadingSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.isLoading
);

export const orderErrorSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.error
);
