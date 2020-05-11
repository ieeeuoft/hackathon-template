import axios from "axios";
import { createSlice } from "@reduxjs/toolkit";

export const userReducerName = "user";
export const initialState = {
    userData: {
        data: null,
        isLoading: false,
        errors: null,
    },
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        getUser: (state) => {
            state.userData.isLoading = true;
        },
        getUserSuccess: (state, action) => {
            state.userData.data = action.payload;
            state.userData.isLoading = false;
            state.userData.errors = null;
        },
        getUserFailure: (state, action) => {
            state.userData.isLoading = false;
            state.userData.errors = action.payload.error;
        },
    },
});

export const { actions, reducer } = userSlice;
export const { getUser, getUserSuccess, getUserFailure } = userSlice.actions;
export default reducer;

export const fetchUserData = (id) => {
    return async (dispatch) => {
        dispatch(getUser());

        try {
            const response = await axios.get(
                `https://jsonplaceholder.typicode.com/users/${id}`
            );
            dispatch(getUserSuccess(response.data));
        } catch (e) {
            dispatch(getUserFailure(e));
        }
    };
};
