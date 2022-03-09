import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { push } from "connected-react-router";

import { get, post } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";
import { AppDispatch, RootState } from "slices/store";
import { User } from "api/types";
import { adminGroup } from "constants.js";

interface LoginResponse {
    username?: string;
    email: string;
    password: string;
}

// Slice
interface UserInitialState {
    userData: {
        user: User | null;
        isLoading: boolean;
        error: {
            message: string;
        } | null;
    };
    login: {
        isLoading: boolean;
        failure: {
            message: string;
        } | null;
    };
    logout: {
        isLoading: boolean;
        failure: {
            message: string;
        } | null;
    };
    isAuthenticated: boolean;
}

export const userReducerName = "user";
export const initialState: UserInitialState = {
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
export type UserState = typeof initialState;

// Thunks
interface RejectValue {
    status: number;
    message: any;
}

export const fetchUserData = createAsyncThunk<
    User,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(`${userReducerName}/fetchUserData`, async (arg, { dispatch, rejectWithValue }) => {
    try {
        const response = await get<User>("/api/event/users/user/");
        return response.data;
    } catch (e: any) {
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
                status: 500,
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
});

export const logIn = createAsyncThunk<
    LoginResponse,
    { email: string; password: string },
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${userReducerName}/logIn`,
    async ({ email, password }, { dispatch, rejectWithValue }) => {
        try {
            const response = await post<LoginResponse>("/api/auth/login/", {
                email,
                password,
            });
            dispatch(push("/"));
            return response.data;
        } catch (e: any) {
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

export const logout = createAsyncThunk<
    void,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(`${userReducerName}/logout`, async (arg, { dispatch, rejectWithValue }) => {
    try {
        const response = await post("/api/auth/logout/", null);
        dispatch(push("/"));
        return response.data;
    } catch (e: any) {
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
});

// Slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUserData.pending, (state) => {
            state.userData.isLoading = true;
        });

        builder.addCase(fetchUserData.fulfilled, (state, { payload }) => {
            state.userData.user = payload;
            state.userData.isLoading = false;
            state.userData.error = null;
        });

        builder.addCase(fetchUserData.rejected, (state, { payload }) => {
            state.userData.isLoading = false;
            state.userData.error = payload || { message: "An error has occurred" };
        });

        builder.addCase(logIn.pending, (state) => {
            state.login.isLoading = true;
        });

        builder.addCase(logIn.fulfilled, (state) => {
            state.isAuthenticated = true;
            state.login.isLoading = false;
            state.login.failure = null;
        });

        builder.addCase(logIn.rejected, (state, { payload }) => {
            state.login.failure = payload || { message: "An error has occurred" };
            state.login.isLoading = false;
            state.isAuthenticated = false;
        });

        builder.addCase(logout.pending, (state) => {
            state.logout.isLoading = true;
        });

        builder.addCase(logout.fulfilled, (state) => {
            state.userData.user = null;
            state.isAuthenticated = false;
            state.logout.isLoading = false;
            state.logout.failure = null;
        });

        builder.addCase(logout.rejected, (state, { payload }) => {
            state.logout.failure = payload || { message: "An error has occurred" };
            state.logout.isLoading = false;
        });
    },
});

export const { reducer, actions } = userSlice;
export default reducer;

// Selectors
export const userSliceSelector = (state: RootState) => state[userReducerName];

export const userDataSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.userData
);

export const userSelector = createSelector(
    [userDataSelector],
    (userData) => userData.user
);

export const userTypeSelector = createSelector([userSelector], (user) =>
    user?.profile
        ? "participant"
        : user?.groups.some((group) => group.name === adminGroup)
        ? "admin"
        : "none"
);

export const loginSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.login
);

export const logoutSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.logout
);
