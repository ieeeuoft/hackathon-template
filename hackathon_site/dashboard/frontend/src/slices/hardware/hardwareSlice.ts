import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { RootState } from "slices/store";

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
    quantity_remaining: number;
}

interface HardwareExtraState {
    isLoading: boolean;
    error: string | null;
    next: string | null;
}

const extraState: HardwareExtraState = {
    isLoading: false,
    error: null,
    next: null,
};

export const hardwareReducerName = "hardware";
const hardwareAdapter = createEntityAdapter<Hardware>();
export const initialState = hardwareAdapter.getInitialState(extraState);
export type HardwareState = typeof initialState;

// Slices
const hardwareSlice = createSlice({
    name: hardwareReducerName,
    initialState: hardwareAdapter.getInitialState(extraState),
    reducers: {},
});

export const { actions, reducer } = hardwareSlice;
export default reducer;

// Selectors
export const hardwareSliceSelector = (state: RootState) => state[hardwareReducerName];

export const hardwareSelector = hardwareAdapter.getSelectors(hardwareSliceSelector);
