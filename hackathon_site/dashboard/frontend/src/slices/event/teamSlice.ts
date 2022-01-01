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
import { hardwareNextSelector, hardwareReducerName } from "../hardware/hardwareSlice";

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
export type CartState = typeof initialState;

// Slice
const teamSlice = createSlice({
    name: teamReducerName,
    initialState,
    reducers: {
        addToCart: (state, { payload }: PayloadAction<Team>) => {
            const existingEntity = state.entities[payload.hardware_id.toString()];
            if (existingEntity) {
                cartAdapter.upsertOne(state, {
                    hardware_id: payload.hardware_id,
                    quantity: existingEntity.quantity + payload.quantity,
                });
            } else {
                cartAdapter.addOne(state, payload);
            }
        },
        removeFromCart: (state, { payload }: PayloadAction<number>) => {
            cartAdapter.removeOne(state, payload);
        },
        updateCart: (state, { payload }: PayloadAction<Update<CartItem>>) => {
            cartAdapter.updateOne(state, payload);
        },
    },
});

export const getCurrentTeam = createAsyncThunk<
    APIListResponse<Team> | null,
    void,
    { state: RootState; dispatch: AppDispatch }
>(
    `${teamReducerName}/getCurrentTeam`,
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const nextFromState = hardwareNextSelector(getState());
            if (nextFromState) {
                const { path, filters } = stripHostnameReturnFilters(nextFromState);
                const response = await get<APIListResponse<Hardware>>(path, filters);
                return response.data;
            }
            // return empty response if there is no nextURL
            return null;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `Failed to fetch hardware data: Error ${e.response.status}`,
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
