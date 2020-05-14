import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const userReducerName = "user";
export const initialState = {
    userData: {
        data: null,
        isLoading: false,
        error: null,
    },
};

// Thunks
export const fetchUserById = createAsyncThunk(
    `${userReducerName}/getById`,
    async (userId) => {
        const response = await axios.get(
            `https://jsonplaceholder.typicode.com/users/${userId}`
        );
        return response.data;
    }
);

// Slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: {
        [fetchUserById.pending]: (state) => {
            state.userData.isLoading = true;
        },
        [fetchUserById.fulfilled]: (state, action) => {
            state.userData.data = action.payload;
            state.userData.isLoading = false;
            state.userData.errors = null;
        },
        [fetchUserById.rejected]: (state, action) => {
            state.userData.isLoading = false;
            state.userData.error = action.error;
        },
    },
});

export const { reducer, actions } = userSlice;
export default reducer;

// Selectors
export const userSelector = (state) => state[userReducerName];
export const userDataSelector = (state) => userSelector(state).userData;
