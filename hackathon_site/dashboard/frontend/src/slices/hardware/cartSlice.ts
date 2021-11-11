import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

export interface CartItem {
    hardware_id: number;
    quantity: number;
}

interface CartExtraState {
    isLoading: boolean;
    error: string | null;
    next: string | null;
}

const extraState: CartExtraState = {
    isLoading: false,
    error: null,
    next: null,
};

const cartAdapter = createEntityAdapter<CartItem>();

export const cartReducerName = "cart";
export const initialState = cartAdapter.getInitialState(extraState);

const cartSlice = createSlice({
    name: cartReducerName,
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const payloadQuantity = action.payload.quantity;
            const payloadHardwareId = action.payload.hardware_id;
            const dummyCartItem: CartItem = {
                hardware_id: payloadQuantity,
                quantity: payloadHardwareId,
            };
            cartAdapter.addOne(state, dummyCartItem);
        },
    },
});
