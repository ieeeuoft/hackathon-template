import { createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Slice
interface UIInitialState {
    dashboard: {
        isCheckedOutTableVisible: boolean;
        isReturnedTableVisible: boolean;
        isPendingTableVisible: boolean;
        isEditTeamVisible: boolean;
    };
    inventory: {
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
        isEditTeamVisible: false,
    },
    inventory: {
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
        openProductOverview: (state: UIState) => {
            state.inventory.isProductOverviewVisible = true;
        },
        closeProductOverview: (state: UIState) => {
            state.inventory.isProductOverviewVisible = false;
        },
        openTeamModalItem: (state: UIState) => {
            state.dashboard.isEditTeamVisible = true;
        },
        closeTeamModalItem: (state: UIState) => {
            state.dashboard.isEditTeamVisible = false;
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
    openProductOverview,
    closeProductOverview,
    openTeamModalItem,
    closeTeamModalItem,
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
export const isProductOverviewVisibleSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.inventory.isProductOverviewVisible
);
export const isTeamModalVisibleSelector = createSelector(
    [uiSliceSelector],
    (uiSlice) => uiSlice.dashboard.isEditTeamVisible
);
