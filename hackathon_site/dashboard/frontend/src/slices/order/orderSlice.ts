import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";
import { Order } from "api/types";
import { get } from "api/api";

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

/*



 */
