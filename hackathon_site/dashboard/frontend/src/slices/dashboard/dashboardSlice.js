import { createSlice } from "@reduxjs/toolkit";

// Slice
export const dashboardReducerName = "dashboard";
export const dashboardInitialState = {
    tables: {
        isCheckedOutVisible: true,
        isReturnedVisible: true,
    },
};
const dashboardSlice = createSlice({
    name: dashboardReducerName,
    initialState: dashboardInitialState,
    reducers: {
        toggleCheckedOutTable: (state) => {
            state.tables.isCheckedOutVisible = !state.tables.isCheckedOutVisible;
        },
        toggleReturnedTable: (state) => {
            state.tables.isReturnedVisible = !state.tables.isReturnedVisible;
        },
    },
});

export const { reducer, actions } = dashboardSlice;
export default reducer;

// Selectors
export const dashboardSelector = (state) => state[dashboardReducerName];
export const isCheckedOutTableVisibleSelector = (state) =>
    dashboardSelector(state).tables.isCheckedOutVisible;
export const isReturnedTableVisibleSelector = (state) =>
    dashboardSelector(state).tables.isReturnedVisible;
