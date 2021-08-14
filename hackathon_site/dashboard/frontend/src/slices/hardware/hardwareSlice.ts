import {
    createSlice,
    createEntityAdapter,
    PayloadAction,
    createSelector,
    createAsyncThunk,
} from "@reduxjs/toolkit";
import { RootState } from "slices/store";

import { APIResponse, Hardware, HardwareFilters } from "api/types";
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
interface RejectWithValue {
    status: number;
    message: any;
}

export const getHardwareWithFilters = createAsyncThunk<
    APIResponse<Hardware>,
    void,
    { state: RootState; rejectValue: RejectWithValue }
>(
    `${hardwareReducerName}/getHardwareWithFilters`,
    async (_, { dispatch, getState, rejectWithValue }) => {
        const filters = hardwareFiltersSelector(getState());

        try {
            const response = await get("/api/hardware/hardware/", filters);
            return response.data;
        } catch (e) {
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
type Nullable<T> = {
    [P in keyof T]?: T[P] | null;
};

// type SetFilterArgs = Nullable<HardwareFilters>;
interface UpdateFiltersArgs {
    toSet: HardwareFilters;
    toClear: (keyof HardwareFilters)[];
}

const hardwareSlice = createSlice({
    name: hardwareReducerName,
    initialState: hardwareAdapter.getInitialState(extraState),
    reducers: {
        /**
         * Update the filters for the Hardware API
         *
         * To clear a particular filter, pass to the toClear param
         * */
        updateFilters: (
            state: HardwareState,
            { payload: { toSet, toClear } }: PayloadAction<UpdateFiltersArgs>
        ) => {
            // Set what needs to be set
            state.filters = {
                ...state.filters,
                ...toSet,
            };

            // Delete what needs to be removed
            toClear.forEach((k) => delete state.filters[k]);
        },

        setFilters: (
            state: HardwareState,
            { payload }: PayloadAction<HardwareFilters>
        ) => {
            state.filters = payload;
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

export const { setFilters, updateFilters, clearFilters } = actions;

// Selectors
export const hardwareSliceSelector = (state: RootState) => state[hardwareReducerName];

export const hardwareSelector = hardwareAdapter.getSelectors(hardwareSliceSelector);

export const isLoadingSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.isLoading
);

export const hardwareFiltersSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.filters
);
