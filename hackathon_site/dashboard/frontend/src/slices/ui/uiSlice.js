import { createSlice } from "@reduxjs/toolkit";

// Slice
export const uiReducerName = "ui";
export const uiInitialState = {
    dashboard: {
        isCheckedOutTableVisible: true,
        isReturnedTableVisible: true,
    },
};
const uiSlice = createSlice({
    name: uiReducerName,
    initialState: uiInitialState,
    reducers: {
        toggleCheckedOutTable: (state) => {
            state.dashboard.isCheckedOutTableVisible = !state.dashboard
                .isCheckedOutTableVisible;
        },
        toggleReturnedTable: (state) => {
            state.dashboard.isReturnedTableVisible = !state.dashboard
                .isReturnedTableVisible;
        },
    },
});

export const { reducer, actions } = uiSlice;
export default reducer;

// Selectors
export const uiSelector = (state) => state[uiReducerName];
export const isCheckedOutTableVisibleSelector = (state) =>
    uiSelector(state).dashboard.isCheckedOutTableVisible;
export const isReturnedTableVisibleSelector = (state) =>
    uiSelector(state).dashboard.isReturnedTableVisible;
