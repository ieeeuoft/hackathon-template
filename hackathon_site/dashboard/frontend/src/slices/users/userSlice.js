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
    // acknowledge: {
    //     isCheckbox1checked: false,
    //     isCheckbox2checked: false,
    //     isCheckbox3checked: false,
    //     isCheckbox4checked: false,
    //     hasSignature: false,
    //     fail: null,
    // },
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

// export const acknowledge = createAsyncThunk(
//     `${userReducerName}/acknowledge`,
//     async({signature}, {dispatch, rejectWithValue}) => {
//         try {
//             const response = await post("/api/acknowledge",{signature});
//             dispatch(push("/"));
//             return response.data;
//         } catch (e) {
//             if(e.response.status === 400) {
//                 return rejectWithValue({ status: 400, message: "Invalid credentials" });
//             }else if (
//                 e.response.status === 403 &&
//                 e.response.data &&
//                 e.response.data.detail.includes("CSRF")
//             ) {
//                 return rejectWithValue({
//                     status: e.response.status,
//                     message: "Invalid CSRF Token",
//                 });
//             }
//             return rejectWithValue({
//                 status: e.response.status,
//                 message: e.response.data,
//             });
//         }
//     }
// );

// Slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // toggleCheckbox1: (state) => {
        //     state.acknowledge.isCheckbox1checked = !state.acknowledge.isCheckbox1checked;
        // },
        // toggleCheckbox2: (state) => {
        //     state.acknowledge.isCheckbox2checked = !state.acknowledge.isCheckbox2checked;
        // },
        // toggleCheckbox3: (state) => {
        //     state.acknowledge.isCheckbox3checked = !state.acknowledge.isCheckbox3checked;
        // },
        // toggleCheckbox4: (state) => {
        //     state.acknowledge.isCheckbox4checked = !state.acknowledge.isCheckbox4checked;
        // },
    },
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
        // [acknowledge.pending]: (state) => {
        //     state.acknowledge.hasSignature = false;
        // },
        // [acknowledge.fulfilled]: (state) => {
        //     state.acknowledge.hasSignature = true;
        // },
        // [acknowledge.rejected]: (state, action) => {
        //     state.acknowledge.fail = action.payload || { message: action.error.message };
        //     state.acknowledge.hasSignature = false;
        // },
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

// export const acknowledgeSelector = createSelector(
//     [userSliceSelector],
//     (userSlice) => userSlice.acknowledge
// );
