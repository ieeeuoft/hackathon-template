import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { push } from "connected-react-router";

import { post } from "api/api";

export const userReducerName = "user";
export const initialState = {
    userData: {
        data: null,
        isLoading: false,
        error: null,
    },
    login: {
        isLoading: false,
        failure: null,
    },
    isAuthenticated: false,
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

export const logIn = createAsyncThunk(
    `${userReducerName}/logIn`,
    async ({ username, password }, { dispatch, rejectWithValue }) => {
        try {
            const response = await post("/api/auth/login/", { username, password });
            dispatch(push("/"));
            return response.data;
        } catch (e) {
            if (e.response.status === 400) {
                // Invalid credentials
                return rejectWithValue({ status: 400, message: "Invalid credentials" });
            } else if (
                e.response.status === 403 &&
                e.response.data &&
                e.response.data.detail.includes("CSRF")
            ) {
                return rejectWithValue({
                    status: e.response.status,
                    message: "Invalid CSRF Token",
                });
            }
            return rejectWithValue({
                status: e.response.status,
                message: e.response.data,
            });
        }
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
            state.userData.error = null;
        },
        [fetchUserById.rejected]: (state, action) => {
            state.userData.isLoading = false;
            state.userData.error = action.error;
        },
        [logIn.pending]: (state) => {
            state.login.isLoading = true;
        },
        [logIn.fulfilled]: (state) => {
            state.isAuthenticated = true;
            state.login.isLoading = false;
            state.login.failure = null;
        },
        [logIn.rejected]: (state, action) => {
            state.login.failure = action.payload || { message: action.error.message };
            state.login.isLoading = false;
            state.isAuthenticated = false;
        },
    },
});

export const { reducer, actions } = userSlice;
export default reducer;

// Selectors
export const userSelector = (state) => state[userReducerName];
export const userDataSelector = (state) => userSelector(state).userData;
export const loginSelector = (state) => userSelector(state).login;
