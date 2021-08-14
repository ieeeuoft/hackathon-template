import {
    createSlice,
    createEntityAdapter,
    PayloadAction,
    createSelector,
} from "@reduxjs/toolkit";
import { RootState } from "slices/store";
import { Hardware, HardwareFilters } from "api/types";

interface HardwareExtraState {
    isLoading: boolean;
    error: string | null;
    next: string | null;
    filters: HardwareFilters;
}

const extraState: HardwareExtraState = {
    isLoading: false,
    error: null,
    next: null,
    filters: {},
};

export const hardwareReducerName = "hardware";
const hardwareAdapter = createEntityAdapter<Hardware>();
export const initialState = hardwareAdapter.getInitialState(extraState);
export type HardwareState = typeof initialState;

// Slices
const hardwareSlice = createSlice({
    name: hardwareReducerName,
    initialState: hardwareAdapter.getInitialState(extraState),
    reducers: {
        setFilters: (
            state: HardwareState,
            { payload }: PayloadAction<HardwareFilters>
        ) => {
            state.filters = {
                ...state.filters,
                ...payload,
            };
        },
    },
});

export const { actions, reducer } = hardwareSlice;
export default reducer;

export const { setFilters } = actions;

// Selectors
export const hardwareSliceSelector = (state: RootState) => state[hardwareReducerName];

export const hardwareSelector = hardwareAdapter.getSelectors(hardwareSliceSelector);

export const isLoadingSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.isLoading
);
