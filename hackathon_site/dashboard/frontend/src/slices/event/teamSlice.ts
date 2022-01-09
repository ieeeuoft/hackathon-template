import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    PayloadAction,
    Update,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "slices/store";
import { APIListResponse, Hardware, Team } from "api/types";
import { get, stripHostnameReturnFilters } from "../../api/api";
import { displaySnackbar } from "../ui/uiSlice";
import {
    getHardwareNextPage,
    getHardwareWithFilters,
    hardwareNextSelector,
    hardwareReducerName,
} from "../hardware/hardwareSlice";
import { push } from "connected-react-router";
import { fetchUserData, userReducerName } from "../users/userSlice";

interface TeamExtraState {
    isLoading: boolean;
    error: string | null;
    currentTeam: Team;
}

const extraState: TeamExtraState = {
    isLoading: false,
    error: null,
    currentTeam: NULL,
};

const teamAdapter = createEntityAdapter<Team>({
    selectId: (entity) => entity.id,
});

export const teamReducerName = "team";
export const initialState = teamAdapter.getInitialState(extraState);
export type TeamState = typeof initialState;

export const getCurrentTeam = createAsyncThunk(
    `${teamReducerName}/getCurrentTeam`,
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            const response = await get("/api/event/teams/team/");
            return response.data;
        } catch (e) {
            if (!e.response) {
                // This should almost never happen in production, and is likely due to a
                // network error. Mostly here as a sanity check when running locally
                dispatch(
                    displaySnackbar({
                        message: `Failed to fetch team data: ${e.message}`,
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
                        message: `Failed to fetch team data: Error ${e.response.status}`,
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

// Slice
const teamSlice = createSlice({
    name: teamReducerName,
    initialState,
    reducers: {
        // addToCart: (state, { payload }: PayloadAction<Team>) => {
        //     const existingEntity = state.entities[payload.hardware_id.toString()];
        //     if (existingEntity) {
        //         cartAdapter.upsertOne(state, {
        //             hardware_id: payload.hardware_id,
        //             quantity: existingEntity.quantity + payload.quantity,
        //         });
        //     } else {
        //         cartAdapter.addOne(state, payload);
        //     }
        // },
        // removeFromCart: (state, { payload }: PayloadAction<number>) => {
        //     cartAdapter.removeOne(state, payload);
        // },
        // updateCart: (state, { payload }: PayloadAction<Update<CartItem>>) => {
        //     cartAdapter.updateOne(state, payload);
        // },
    },

    extraReducers: (builder) => {
        builder.addCase(getCurrentTeam.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });

        builder.addCase(
            getCurrentTeam.fulfilled,
            (state, { payload }: PayloadAction<Team>) => {
                if (payload) {
                    state.currentTeam = payload;
                    state.isLoading = false;
                    state.error = null;
                }
            }
        );

        // builder.addCase(getCurrentTeam.fulfilled, (state, { payload }) => {
        //     state.isLoading = false;
        //     state.error = null;
        //     if (payload) {
        //         state.next = payload.next;
        //         state.count = payload.count;
        //         hardwareAdapter.addMany(state, payload.results);
        //     }
        // });

        builder.addCase(getCurrentTeam.rejected, (state, { payload }) => {
            state.isMoreLoading = false;
            state.error = payload?.message || "Something went wrong";
        });
    },
});

export const { actions, reducer } = teamSlice;
export default reducer;
export const { addToCart, removeFromCart, updateCart } = actions;

// Selectors
export const teamSliceSelector = (state: RootState) => state[teamReducerName];

export const teamSelectors = teamAdapter.getSelectors(teamSliceSelector);

export const isLoadingSelector = createSelector(
    [teamSliceSelector],
    (teamSlice) => teamSlice.isLoading
);
