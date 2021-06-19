import {
    createAsyncThunk,
    createSlice,
    createSelector,
    createEntityAdapter,
    configureStore,
} from "@reduxjs/toolkit";
import { push } from "connected-react-router";

import { get, post } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";
import { inventoryItems } from "testing/mockData";

// type Hardware = {
//     id: number,
//     name: string,
//     model_number: string,
//     manufacturer: string,
//     datasheet: string,
//     quantity_available: number,
//     notes: string,
//     max_per_team: number,
//     picture: string,
//     categories: Array<number>,
//     quantity_remaining: string,
// };

export const hardwareReducerName = "hardware";
const hardwareAdapter = createEntityAdapter();
export const initialState = {
    isLoading: false,
    error: null,
    next: null,
};

// Thunks
export const fetchHardware = createAsyncThunk(
    `${hardwareReducerName}/fetchHardware`,
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            const response = await get("/api/hardware/hardware/");
            console.log("fetchHardware RESPONSE", response);
            // return response.data;
            return inventoryItems;
        } catch (e) {
            return inventoryItems;
            if (!e.response) {
                // This should almost never happen in production, and is likely due to a
                // network error. Mostly here as a sanity check when running locally
                dispatch(
                    displaySnackbar({
                        message: `Failed to fetch hardware data: ${e.message}`,
                        options: { variant: "error" },
                    })
                );
                return rejectWithValue({
                    status: null,
                    message: e.message,
                });
            } else {
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
    }
);

// Slices
const hardwareSlice = createSlice({
    name: hardwareReducerName,
    initialState: hardwareAdapter.getInitialState(initialState),
    extraReducers: {
        [fetchHardware.pending]: (state) => {
            state.isLoading = true;
        },
        [fetchHardware.fulfilled]: (state, action) => {
            state.isLoading = false;
            state.error = null;
            hardwareAdapter.upsertMany(state, action.payload);
        },
        [fetchHardware.rejected]: (state, action) => {
            state.isLoading = false;
            state.error = action.payload || { message: action.error.message };
        },
    },
});

export const { actions, reducer } = hardwareSlice;
const { hardwareAdded, hardwaresReceived, hardwareUpdated } = actions;
export default reducer;

// Selectors
export const hardwareSliceSelector = (state) => state[hardwareReducerName];

export const hardwareSelector = hardwareAdapter.getSelectors(hardwareSliceSelector);
