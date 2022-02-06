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
import { AxiosResponse } from "axios";

export interface CartExtraState {
    isLoading: boolean;
    error: string | null;
}

const extraState: CartExtraState = {
    isLoading: false,
    error: null,
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
    hardware: [
        {
            hardware_id: number;
            quantity_fulfilled: number;
        }
    ];
    errors:
        | [
              {
                  hardware_id: number;
                  message: string;
              }
          ]
        | [];
}

export const submitOrder = createAsyncThunk<
    AxiosResponse<OrderResponse>,
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
            const response = await post("/api/hardware/orders/", {
                hardware: cartItems,
            });
            dispatch(push("/"));
            dispatch(
                displaySnackbar({
                    message: `Order has been submitted.`,
                    options: {
                        variant: "success",
                    },
                })
            );
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `Failed to fetch hardware data: Error ${e.response.status}`,
                    options: { variant: "error" },
                })
            );
            return rejectWithValue({
                status: e.response.status,
                message: e.response.data,
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
        },
        removeFromCart: (state, { payload }: PayloadAction<number>) => {
            cartAdapter.removeOne(state, payload);
        },
        updateCart: (state, { payload }: PayloadAction<Update<CartItem>>) => {
            cartAdapter.updateOne(state, payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(submitOrder.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(submitOrder.fulfilled, (state) => {
            state.isLoading = false;
            state.error = null;
            cartAdapter.removeAll(state);
        });
        builder.addCase(submitOrder.rejected, (state, payload) => {
            state.isLoading = false;
            state.error = payload.error.message!;
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
