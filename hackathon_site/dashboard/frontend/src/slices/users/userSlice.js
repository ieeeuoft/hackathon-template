import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { push } from "connected-react-router";

import { get, post } from "api/api";

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

export const fetchUserData = createAsyncThunk(
    `${userReducerName}/fetchUserData`,
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            const response = await get("/api/event/users/user/");
            return response.data;
        } catch (e) {
            if (e.response.status === 401) {
                // Unauthenticated
                dispatch(push("/login"));
                return rejectWithValue({
                    status: 401,
                    message: e.response.data.detail,
                });
            } else if (e.response.status === 404) {
                // No profile, so shouldn't have access to the dashboard
                alert("Get out");
            }
        }
    }
);

export const logIn = createAsyncThunk(
    `${userReducerName}/logIn`,
    async ({ email, password }, { dispatch, rejectWithValue }) => {
        try {
            const response = await post("/api/auth/login/", { email, password });
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
        [fetchUserData.pending]: (state) => {
            state.userData.isLoading = true;
        },
        [fetchUserData.fulfilled]: (state, action) => {
            state.userData.data = action.payload;
            state.userData.isLoading = false;
            state.userData.error = null;
        },
        [fetchUserData.rejected]: (state, action) => {
            state.userData.isLoading = false;
            state.userData.error = action.payload || { message: action.error.message };
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
export const userSliceSelector = (state) => state[userReducerName];
export const userDataSelector = (state) => userSliceSelector(state).userData;
export const loginSelector = (state) => userSliceSelector(state).login;
