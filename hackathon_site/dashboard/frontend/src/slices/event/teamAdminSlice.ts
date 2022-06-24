import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get } from "../../api/api";

interface TeamAdminExtraState {
    errorState: string | null;
    isLoading: boolean;
}

export const teamAdminName = "adminTeam";

const initialState: TeamAdminExtraState = {
    isLoading: false,
    errorState: null,
};

export const getAllTeams = createAsyncThunk(
    `${teamAdminName}/getAllTeams`,
    async () => {
        try {
            const response = await get("api/event/teams/");
            console.log(response.data);
        } catch (e) {}
    }
);

const teamAdminSlice = createSlice({
    name: teamAdminName,
    initialState: initialState, // initialState is sufficient
    reducers: {},
    extraReducers: () => {},
});

export const { actions, reducer } = teamAdminSlice;
export default reducer;
