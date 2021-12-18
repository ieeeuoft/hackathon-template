import {
    createEntityAdapter,
    createSelector,
    createSlice,
    PayloadAction,
    Update,
} from "@reduxjs/toolkit";
import { RootState } from "slices/store";
import { CartItem } from "api/types";

interface CartExtraState {
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
