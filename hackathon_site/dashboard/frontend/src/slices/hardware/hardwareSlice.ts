import {
    createSlice,
    createEntityAdapter,
    PayloadAction,
    createSelector,
    createAsyncThunk,
} from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "slices/store";

import { APIListResponse, Hardware, HardwareFilters } from "api/types";
import { get } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

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

// Thunks
interface RejectValue {
    status: number;
    message: any;
}

export const getHardwareWithFilters = createAsyncThunk<
    APIListResponse<Hardware>,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${hardwareReducerName}/getHardwareWithFilters`,
    async (_, { dispatch, getState, rejectWithValue }) => {
        const filters = hardwareFiltersSelector(getState());

        try {
            const response = await get<APIListResponse<Hardware>>(
                "/api/hardware/hardware/",
                filters
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

const hardwareSlice = createSlice({
    name: hardwareReducerName,
    initialState,
    reducers: {
        /**
         * Update the filters for the Hardware API
         *
         * To clear a particular filter, set the field to undefined.
         */
        setFilters: (
            state: HardwareState,
            { payload }: PayloadAction<HardwareFilters>
        ) => {
            const { in_stock, hardware_ids, category_ids, search, ordering } = {
                ...state.filters,
                ...payload,
            };

            // Remove values that are empty or falsy
            state.filters = {
                ...(in_stock && { in_stock }),
                ...(hardware_ids && hardware_ids.length > 0 && { hardware_ids }),
                ...(category_ids && category_ids.length > 0 && { category_ids }),
                ...(search && { search }),
                ...(ordering && { ordering }),
            };
        },

        clearFilters: (
            state: HardwareState,
            { payload }: PayloadAction<{ saveSearch?: boolean } | undefined>
        ) => {
            const { search } = state.filters;

            state.filters = {};

            if (payload?.saveSearch) {
                state.filters.search = search;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getHardwareWithFilters.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });

        builder.addCase(getHardwareWithFilters.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            state.next = payload.next;
            hardwareAdapter.setAll(state, payload.results);
        });

        builder.addCase(getHardwareWithFilters.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error = payload?.message || "Something went wrong";
        });
    },
});

export const { actions, reducer } = hardwareSlice;
export default reducer;

export const { setFilters, clearFilters } = actions;

// Selectors
export const hardwareSliceSelector = (state: RootState) => state[hardwareReducerName];

export const hardwareSelectors = hardwareAdapter.getSelectors(hardwareSliceSelector);

export const isLoadingSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.isLoading
);

export const hardwareFiltersSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.filters
);
