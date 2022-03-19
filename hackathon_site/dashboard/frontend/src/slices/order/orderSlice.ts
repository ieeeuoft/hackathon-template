import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";
import { Order } from "api/types";
import { get } from "api/api";
import { RootState } from "../store";
import { cartReducerName } from "../hardware/cartSlice";

interface OrderExtraState {
    isLoading: boolean;
    error: string | null;
}

const extraState: OrderExtraState = {
    isLoading: false,
    error: null,
};

const orderAdapter = createEntityAdapter<Order>({
    selectId: (entity) => entity.id,
});

export const orderReducerName = "order";
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
//export const { addToCart, removeFromCart, updateCart } = actions;

// Selectors
export const orderSliceSelector = (state: RootState) => state[orderReducerName];

export const orderSelectors = orderAdapter.getSelectors(orderSliceSelector);

export const isLoadingSelector = createSelector(
    [orderSliceSelector],
    (orderSlice) => orderSlice.isLoading
);
