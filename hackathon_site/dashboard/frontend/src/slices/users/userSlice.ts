import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { push } from "connected-react-router";

import { get, post } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";
import { AppDispatch, RootState } from "slices/store";
import { Profile, ProfileRequestBody, User, UserWithReviewStatus } from "api/types";
import { adminGroup, hssTestUserGroup } from "constants.js";

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
    userAcceptance: {
        user: UserWithReviewStatus | null;
        isLoading: boolean;
        error: {
            message: string;
        } | null;
    };
    createProfile: {
        profile: Profile | null;
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
    userAcceptance: {
        user: null,
        isLoading: false,
        error: null,
    },
    createProfile: {
        profile: null,
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

export const fetchUserAcceptanceStatus = createAsyncThunk<
    UserWithReviewStatus,
    void,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${userReducerName}/fetchUserAcceptanceStatus`,
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            const response = await get<UserWithReviewStatus>(
                "/api/event/users/user/review_status/"
            );
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `Failed to fetch user acceptance data: Error ${e.response.status}`,
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
>(`${userReducerName}/logout`, async (_, { dispatch, rejectWithValue }) => {
    try {
        const response = await post<void>("/api/auth/logout/", null);
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

export const createProfile = createAsyncThunk<
    Profile,
    ProfileRequestBody,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${userReducerName}/createProfile`,
    async (profileRequestBody, { dispatch, rejectWithValue }) => {
        try {
            const response = await post<Profile>(
                "/api/event/profiles/profile/",
                profileRequestBody
            );
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `An error has occurred! We couldn't grant you permission to access Hardware Signout Site: Error ${e.response.status}`,
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

        builder.addCase(fetchUserAcceptanceStatus.pending, (state) => {
            state.userAcceptance.isLoading = true;
        });

        builder.addCase(fetchUserAcceptanceStatus.fulfilled, (state, { payload }) => {
            state.userAcceptance.user = payload;
            state.userAcceptance.isLoading = false;
            state.userAcceptance.error = null;
        });

        builder.addCase(fetchUserAcceptanceStatus.rejected, (state, { payload }) => {
            state.userAcceptance.error = payload || {
                message: "An error has occurred",
            };
            state.userAcceptance.isLoading = false;
        });

        builder.addCase(createProfile.pending, (state) => {
            state.createProfile.isLoading = true;
        });

        builder.addCase(createProfile.fulfilled, (state, { payload }) => {
            state.createProfile.profile = payload;
            state.createProfile.isLoading = false;
            state.createProfile.error = null;
        });

        builder.addCase(createProfile.rejected, (state, { payload }) => {
            state.createProfile.error = payload || { message: "An error has occurred" };
            state.createProfile.isLoading = false;
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

export const isTestUserSelector = createSelector([userSelector], (user) =>
    user?.groups.find((group) => group.name === hssTestUserGroup)
);

export const loginSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.login
);

export const logoutSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.logout
);

export const userAcceptanceSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.userAcceptance
);

export const createProfileSelector = createSelector(
    [userSliceSelector],
    (userSlice) => userSlice.createProfile
);
