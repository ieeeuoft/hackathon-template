import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

export interface Hardware {
    id: number;
    name: string;
    model_number: string;
    manufacturer: string;
    datasheet: string;
    quantity_available: number;
    notes: string;
    max_per_team: number;
    picture: string;
    categories: number[];
    quantity_remaining: string;
}

export interface HardwareState {
    isLoading: boolean;
    error: string | null;
    next: string | null;
}

export const hardwareReducerName = "hardware";
const hardwareAdapter = createEntityAdapter();
export const initialState: HardwareState = {
    isLoading: false,
    error: null,
    next: null,
};

// Slices
const hardwareSlice = createSlice({
    name: hardwareReducerName,
    initialState: hardwareAdapter.getInitialState(initialState),
    reducers: {},
});

export const { actions, reducer } = hardwareSlice;
export default reducer;

// Selectors
export const hardwareSliceSelector = (state) => state[hardwareReducerName];

export const hardwareSelector = hardwareAdapter.getSelectors(hardwareSliceSelector);
