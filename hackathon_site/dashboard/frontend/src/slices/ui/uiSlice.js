import { createSlice } from "@reduxjs/toolkit";

// Slice
export const uiReducerName = "ui";
export const initialState = {
    dashboard: {
        isCheckedOutTableVisible: true,
        isReturnedTableVisible: true,
        isPendingTableVisible: true,
    },
    snackbars: [],
};
const uiSlice = createSlice({
    name: uiReducerName,
    initialState: initialState,
    reducers: {
        toggleCheckedOutTable: (state) => {
            state.dashboard.isCheckedOutTableVisible = !state.dashboard
                .isCheckedOutTableVisible;
        },
        toggleReturnedTable: (state) => {
            state.dashboard.isReturnedTableVisible = !state.dashboard
                .isReturnedTableVisible;
        },
        togglePendingTable: (state) => {
            state.dashboard.isPendingTableVisible = !state.dashboard
                .isPendingTableVisible;
        },
        displaySnackbar: (state, { payload: { message, options = {} } }) => {
            if (!options.key) {
                options.key = Math.random();
            }

            state.snackbars = [
                ...state.snackbars,
                { message, options, dismissed: false },
            ];
        },
        dismissSnackbar: (state, { payload: { key } }) => {
            /* Mark an individual snackbar as dismissed by providing a key, or
             * dismiss all snackbars by not providing a key */
            const dismissAll = !key;
            state.snackbars = state.snackbars.map((snackbar) =>
                dismissAll || snackbar.options.key === key
                    ? { ...snackbar, dismissed: true }
                    : { ...snackbar }
            );
        },
        removeSnackbar: (state, { payload: { key } }) => {
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
    displaySnackbar,
    dismissSnackbar,
    removeSnackbar,
} = actions;
export default reducer;

// Selectors
export const uiSelector = (state) => state[uiReducerName];
export const isCheckedOutTableVisibleSelector = (state) =>
    uiSelector(state).dashboard.isCheckedOutTableVisible;
export const isReturnedTableVisibleSelector = (state) =>
    uiSelector(state).dashboard.isReturnedTableVisible;
export const isPendingTableVisibleSelector = (state) =>
    uiSelector(state).dashboard.isPendingTableVisible;
export const snackbarSelector = (state) => uiSelector(state).snackbars;
