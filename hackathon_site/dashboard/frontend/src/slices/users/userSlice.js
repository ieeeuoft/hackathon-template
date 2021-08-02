import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { push } from "connected-react-router";

import { get, post } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

export const userReducerName = "user";
export const initialState = {
    userData: {
        user: null,
        isLoading: false,
        error: null,
    },
    login: {
        isLoading: false,
        failure: null,
    },
    logout: {
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
            if (!e.response) {
                // This should almost never happen in production, and is likely due to a
                // network error. Mostly here as a sanity check when running locally
                dispatch(
                    displaySnackbar({
                        message: `Failed to fetch user data: ${e.message}`,
                        options: { variant: "error" },
                    })
                );
                return rejectWithValue({
                    status: null,
                    message: e.message,
                });
            } else if (e.response.status === 401) {
                // Unauthenticated
                dispatch(push("/login"));
                return rejectWithValue({
                    status: 401,
                    message: e.response.data.detail,
                });
            } else {
                dispatch(
                    displaySnackbar({
                        message: `Failed to fetch user data: Error ${e.response.status}`,
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

export const logout = createAsyncThunk(
    `${userReducerName}/logout`,
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            const response = await post("/api/auth/logout/", null);
            dispatch(push("/"));
            return response.data;
        } catch (e) {
            dispatch(
                displaySnackbar({
                    message: e.response.data.detail,
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
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: {
        [fetchUserData.pending]: (state) => {
            state.userData.isLoading = true;
        },
        [fetchUserData.fulfilled]: (state, action) => {
            state.userData.user = action.payload;
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
        [logout.pending]: (state) => {
            state.logout.isLoading = true;
        },
        [logout.fulfilled]: (state) => {
            state.userData.user = null;
            state.isAuthenticated = false;
            state.logout.isLoading = false;
            state.logout.failure = null;
        },
        [logout.rejected]: (state, action) => {
            state.logout.failure = action.payload || { message: action.error.message };
            state.logout.isLoading = false;
        },
    },
});

export const { reducer, actions } = userSlice;
export default reducer;

// Selectors
export const userSliceSelector = (state) => state[userReducerName];

export const userDataSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.userData
);

export const userSelector = createSelector(
    [userDataSelector],
    (userData) => userData.user
);

export const loginSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.login
);

export const logoutSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.logout
);
