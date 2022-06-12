import {
    createSlice,
    createEntityAdapter,
    PayloadAction,
    createSelector,
    createAsyncThunk,
} from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "slices/store";

import { APIListResponse, Hardware, HardwareFilters } from "api/types";
import { get, stripHostnameReturnFilters } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

interface HardwareExtraState {
    isUpdateDetailsLoading: boolean;
    isLoading: boolean;
    isMoreLoading: boolean;
    error: string | null;
    next: string | null;
    filters: HardwareFilters;
    count: number;
    hardwareIdInProductOverview: number | null;
}

const extraState: HardwareExtraState = {
    isUpdateDetailsLoading: false,
    isLoading: false,
    isMoreLoading: false,
    error: null,
    next: null,
    filters: {},
    count: 0,
    hardwareIdInProductOverview: null,
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
    { keepOld?: boolean } | undefined,
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

export const getHardwareNextPage = createAsyncThunk<
    APIListResponse<Hardware> | null,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${hardwareReducerName}/getHardwareNextPage`,
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const nextFromState = hardwareNextSelector(getState());
            if (nextFromState) {
                const { path, filters } = stripHostnameReturnFilters(nextFromState);
                const response = await get<APIListResponse<Hardware>>(path, filters);
                return response.data;
            }
            // return empty response if there is no nextURL
            return null;
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

export const getUpdatedHardwareDetails = createAsyncThunk<
    Hardware | null,
    number,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${hardwareReducerName}/getHardwareDetails`,
    async (hardware_id, { dispatch, getState, rejectWithValue }) => {
        try {
            const response = await get<Hardware>(
                `/api/hardware/hardware/${hardware_id}/`
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

            if (payload?.saveSearch && search) {
                state.filters.search = search;
            }
        },

        removeProductOverviewItem: (state: HardwareState) => {
            state.hardwareIdInProductOverview = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getHardwareWithFilters.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });

        builder.addCase(
            getHardwareWithFilters.fulfilled,
            (state, { payload, meta }) => {
                state.isLoading = false;
                state.error = null;
                state.next = payload.next;
                state.count = payload.count;

                if (meta.arg?.keepOld) {
                    hardwareAdapter.setMany(state, payload.results);
                } else {
                    hardwareAdapter.setAll(state, payload.results);
                }
            }
        );

        builder.addCase(getHardwareWithFilters.rejected, (state, { payload }) => {
            state.isMoreLoading = false;
            state.error = payload?.message || "Something went wrong";
        });

        builder.addCase(getHardwareNextPage.pending, (state) => {
            state.isLoading = false;
            state.isMoreLoading = true;
            state.error = null;
        });

        builder.addCase(getHardwareNextPage.fulfilled, (state, { payload }) => {
            state.isMoreLoading = false;
            state.error = null;
            if (payload) {
                state.next = payload.next;
                state.count = payload.count;
                hardwareAdapter.addMany(state, payload.results);
            }
        });

        builder.addCase(getHardwareNextPage.rejected, (state, { payload }) => {
            state.isMoreLoading = false;
            state.error = payload?.message || "Something went wrong";
        });

        builder.addCase(getUpdatedHardwareDetails.pending, (state) => {
            state.isUpdateDetailsLoading = true;
        });

        builder.addCase(getUpdatedHardwareDetails.fulfilled, (state, { payload }) => {
            if (payload) {
                state.isUpdateDetailsLoading = false;
                state.hardwareIdInProductOverview = payload.id;
                hardwareAdapter.updateOne(state, {
                    id: payload.id,
                    changes: payload,
                });
            }
        });

        builder.addCase(getUpdatedHardwareDetails.rejected, (state, { payload }) => {
            state.isUpdateDetailsLoading = false;
        });
    },
});

export const { actions, reducer } = hardwareSlice;
export default reducer;

export const { setFilters, clearFilters, removeProductOverviewItem } = actions;

// Selectors
export const hardwareSliceSelector = (state: RootState) => state[hardwareReducerName];

export const hardwareSelectors = hardwareAdapter.getSelectors(hardwareSliceSelector);

export const isLoadingSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.isLoading
);

export const isMoreLoadingSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.isMoreLoading
);

export const isUpdateDetailsLoading = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.isUpdateDetailsLoading
);

export const hardwareCountSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.count
);

export const hardwareFiltersSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.filters
);

export const hardwareNextSelector = createSelector(
    [hardwareSliceSelector],
    (hardwareSlice) => hardwareSlice.next
);

export const selectHardwareByIds = createSelector(
    [hardwareSelectors.selectEntities, (state: RootState, ids: number[]) => ids],
    (entities, ids) => ids.map((id) => entities?.[id])
);

export const hardwareInProductOverviewSelector = createSelector(
    [hardwareSelectors.selectEntities, hardwareSliceSelector],
    (entities, hardwareSlice) =>
        hardwareSlice.hardwareIdInProductOverview
            ? entities[hardwareSlice.hardwareIdInProductOverview]
            : null
);
