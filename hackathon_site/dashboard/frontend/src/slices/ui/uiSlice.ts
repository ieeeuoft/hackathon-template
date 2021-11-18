import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Hardware } from "api/types";
import { RootState } from "../store";

// Slice
interface UIInitialState {
    dashboard: {
        isCheckedOutTableVisible: boolean;
        isReturnedTableVisible: boolean;
        isPendingTableVisible: boolean;
    };
    inventory: {
        hardwareItemBeingViewed: Hardware | null;
        isProductOverviewVisible: boolean;
    };
    snackbars: {
        message: string;
        options: {
            key: number;
        };
        dismissed: boolean;
    }[];
}
export const uiReducerName = "ui";
export const initialState: UIInitialState = {
    dashboard: {
        isCheckedOutTableVisible: true,
        isReturnedTableVisible: true,
        isPendingTableVisible: true,
    },
    inventory: {
        hardwareItemBeingViewed: null,
        isProductOverviewVisible: false,
    },
    snackbars: [],
};
export type UIState = typeof initialState;
const uiSlice = createSlice({
    name: uiReducerName,
    initialState,
    reducers: {
        toggleCheckedOutTable: (state: UIState) => {
            state.dashboard.isCheckedOutTableVisible =
                !state.dashboard.isCheckedOutTableVisible;
        },
        toggleReturnedTable: (state: UIState) => {
            state.dashboard.isReturnedTableVisible =
                !state.dashboard.isReturnedTableVisible;
        },
        togglePendingTable: (state: UIState) => {
            state.dashboard.isPendingTableVisible =
                !state.dashboard.isPendingTableVisible;
        },
        setProductOverviewItem: (
            state: UIState,
            { payload }: PayloadAction<Hardware>
        ) => {
            state.inventory.hardwareItemBeingViewed = payload;
            state.inventory.isProductOverviewVisible = true;
        },
        removeProductOverviewItem: (state: UIState) => {
            state.inventory.hardwareItemBeingViewed = null;
            state.inventory.isProductOverviewVisible = false;
        },
        displaySnackbar: (state: UIState, { payload: { message, options = {} } }) => {
            if (!options.key) {
                options.key = Math.random();
            }

            if (state.snackbars) {
                state.snackbars = [
                    ...state.snackbars,
                    { message, options, dismissed: false },
                ];
            } else {
                state.snackbars = [{ message, options, dismissed: false }];
            }
        },
        dismissSnackbar: (state: UIState, { payload: { key } }) => {
            /* Mark an individual snackbar as dismissed by providing a key, or
             * dismiss all snackbars by not providing a key */
            const dismissAll = !key;
            state.snackbars = state.snackbars.map((snackbar) =>
                dismissAll || snackbar.options.key === key
                    ? { ...snackbar, dismissed: true }
                    : { ...snackbar }
            );
        },
        removeSnackbar: (state: UIState, { payload: { key } }) => {
            /* Once closed, remove a snackbar from the store */
            state.snackbars = state.snackbars.filter(
                (snackbar) => snackbar.options.key !== key
            );
        },
    },
});

export const { actions, reducer } = uiSlice;
export const {
    toggleCheckedOutTable,
    toggleReturnedTable,
    togglePendingTable,
    setProductOverviewItem,
    removeProductOverviewItem,
    displaySnackbar,
    dismissSnackbar,
    removeSnackbar,
} = actions;
export default reducer;

// Selectors
export const uiSliceSelector = (state: RootState) => state[uiReducerName];
export const isCheckedOutTableVisibleSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.dashboard.isCheckedOutTableVisible
);
export const isReturnedTableVisibleSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.dashboard.isReturnedTableVisible
);
export const isPendingTableVisibleSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.dashboard.isPendingTableVisible
);
export const snackbarSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.snackbars
);
export const hardwareBeingViewedSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.inventory.hardwareItemBeingViewed
);
export const isProductOverviewVisibleSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.inventory.isProductOverviewVisible
);
