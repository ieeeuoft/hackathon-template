import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit";
import { post } from "api/api";
import { Incident } from "api/types";
import { push } from "connected-react-router";
import { AppDispatch, RootState } from "slices/store";
import { displaySnackbar } from "slices/ui/uiSlice";
import { IncidentState } from "api/types";

export interface IncidentRequestBody {
    state: IncidentState;
    time_occurred: string; //($date-time)
    description: string;
    order_item: number;
}

export interface IncidentResponse {
    id: number;
    state: string;
    time_occurred: string;
    description: string;
    order_item: number;
    team_id: number;
    created_at: string;
    updated_at: string;
}

export interface IncidentInitialState {
    isLoading: boolean;
    error: null | string;
    incident: null | IncidentResponse;
}

const extraState: IncidentInitialState = {
    isLoading: false,
    error: null,
    incident: null,
};

const incidentAdapter = createEntityAdapter<Incident>();

export const incidentReducerName = "incident";
export const initialState: IncidentInitialState =
    incidentAdapter.getInitialState(extraState);

interface RejectValue {
    status: number;
    message: any;
}

export const createIncident = createAsyncThunk<
    IncidentResponse,
    IncidentRequestBody,
    { state: RootState; rejectValue: RejectValue; dispatch: AppDispatch }
>(
    `${incidentReducerName}/createIncident`,
    async (incident, { dispatch, rejectWithValue }) => {
        try {
            const response = await post<IncidentResponse>(
                "/api/hardware/incidents/",
                incident
            );

            dispatch(push("/"));
            dispatch(
                displaySnackbar({
                    message: `Successfully submitted incident form!`,
                    options: { variant: "success" },
                })
            );
            return response.data;
        } catch (e: any) {
            dispatch(
                displaySnackbar({
                    message: `An error has occurred! We couldn't submit your incident!`,
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

const incidentSlice = createSlice({
    name: incidentReducerName,
    initialState,
    reducers: {}, // used when we want to change state (w/ network req.)
    extraReducers: (builder) => {
        // used specifically for thunks
        // pending, fulfilled, rejects are built in states from redux
        builder.addCase(createIncident.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createIncident.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            state.incident = payload;
            // need to use the payload and put it into incident
        });
        builder.addCase(createIncident.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error =
                payload === undefined
                    ? "An internal server error has occurred, please inform hackathon organizers if this continues to happen."
                    : payload.message;
        });
    },
});

export const { reducer, actions } = incidentSlice;
export default reducer;

// Selectors
export const incidentSliceSelector = (state: RootState) => state[incidentReducerName];

export const isLoadingSelector = createSelector(
    [incidentSliceSelector],
    (incidentSlice) => incidentSlice.isLoading
);

export const errorSelector = createSelector(
    [incidentSliceSelector],
    (incidentSlice) => incidentSlice.error
);
