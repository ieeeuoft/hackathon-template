import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    PayloadAction,
    Update,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "slices/store";
import { CartItem } from "api/types";
import { post } from "api/api";
import { push } from "connected-react-router";
import { displaySnackbar } from "slices/ui/uiSlice";

type fulfillmentError = { hardware_id: number; message: string };

export interface CartExtraState {
    isLoading: boolean;
    error: string | string[] | null;
    fulfillmentError: {
        order_id: number;
        errors: fulfillmentError[];
    } | null;
}

const extraState: CartExtraState = {
    isLoading: false,
    error: null,
    fulfillmentError: null,
};

const cartAdapter = createEntityAdapter<CartItem>({
    selectId: (entity) => entity.hardware_id,
});

export const cartReducerName = "cart";
export const initialState = cartAdapter.getInitialState(extraState);
export type CartState = typeof initialState;

// Thunk
interface RejectValue {
    status: number;
    message: string[];
}

export interface OrderResponse {
    order_id: number;
    hardware: {
        hardware_id: number;
        quantity_fulfilled: number;
    }[];
    errors: fulfillmentError[];
}

export const submitOrder = createAsyncThunk<
    OrderResponse,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${cartReducerName}/submitOrder`,
    async (_, { dispatch, getState, rejectWithValue }) => {
        const cartItems = cartSelectors
            .selectAll(getState())
            .map(({ hardware_id, ...rest }) => ({
                id: hardware_id,
                ...rest,
            }));

        try {
            const response = await post<OrderResponse>("/api/hardware/orders/", {
                hardware: cartItems,
            });
            dispatch(push("/"));
            if (response.data?.errors?.length > 0) {
                dispatch(
                    displaySnackbar({
                        message: "Order has been submitted with modifications",
                        options: {
                            variant: "info",
                        },
                    })
                );
            } else {
                dispatch(
                    displaySnackbar({
                        message: `Order has been submitted.`,
                        options: {
                            variant: "success",
                        },
                    })
                );
            }
            return response.data;
        } catch (e: any) {
            // order reached quantity limits
            const errorData = e.response?.data?.non_field_errors;

            dispatch(
                displaySnackbar({
                    message: errorData
                        ? "There are some problems with your order."
                        : `Failed to submit order: Error ${e.response.status}`,
                    options: { variant: "error" },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message: errorData ?? e.response.message,
            });
        }
    }
);

// Slice
const cartSlice = createSlice({
    name: cartReducerName,
    initialState,
    reducers: {
        addToCart: (state, { payload }: PayloadAction<CartItem>) => {
            const existingEntity = state.entities[payload.hardware_id.toString()];
            if (existingEntity) {
                cartAdapter.upsertOne(state, {
                    hardware_id: payload.hardware_id,
                    quantity: existingEntity.quantity + payload.quantity,
                });
            } else {
                cartAdapter.addOne(state, payload);
            }
            state.fulfillmentError = null;
            state.error = null;
        },
        removeFromCart: (state, { payload }: PayloadAction<number>) => {
            cartAdapter.removeOne(state, payload);
            state.error = null;
            state.fulfillmentError = null;
        },
        updateCart: (state, { payload }: PayloadAction<Update<CartItem>>) => {
            cartAdapter.updateOne(state, payload);
            state.error = null;
            state.fulfillmentError = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(submitOrder.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.fulfillmentError = null;
        });
        builder.addCase(submitOrder.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            cartAdapter.removeAll(state);
            if (payload?.errors?.length > 0) {
                state.fulfillmentError = {
                    order_id: payload.order_id,
                    errors: payload.errors,
                };
            }
        });
        builder.addCase(submitOrder.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error =
                payload === undefined
                    ? "An internal server error has occurred, please inform hackathon organizers if this continues to happen."
                    : payload.message;
        });
    },
});

export const { actions, reducer } = cartSlice;
export default reducer;
export const { addToCart, removeFromCart, updateCart } = actions;

// Selectors
export const cartSliceSelector = (state: RootState) => state[cartReducerName];

export const cartSelectors = cartAdapter.getSelectors(cartSliceSelector);

export const isLoadingSelector = createSelector(
    [cartSliceSelector],
    (cartSlice) => cartSlice.isLoading
);

export const cartTotalSelector = createSelector(
    [cartSelectors.selectAll],
    (cartItems) => cartItems.reduce((accum, item) => accum + item.quantity, 0)
);

export const errorSelector = createSelector(
    [cartSliceSelector],
    (cartSlice) => cartSlice.error
);

export const fulfillmentErrorSelector = createSelector(
    [cartSliceSelector],
    (cartSlice) => cartSlice.fulfillmentError
);
