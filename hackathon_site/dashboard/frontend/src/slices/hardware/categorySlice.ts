import {
    createSlice,
    createEntityAdapter,
    createSelector,
    createAsyncThunk,
} from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "slices/store";

import { APIListResponse, Category } from "api/types";
import { get, stripHostnameReturnFilters } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";

interface CategoryExtraState {
    isLoading: boolean;
    error: string | null;
    next: string | null;
}

const extraState: CategoryExtraState = {
    isLoading: false,
    error: null,
    next: null,
};

export const categoryReducerName = "category";
const categoryAdapter = createEntityAdapter<Category>();
export const initialState = categoryAdapter.getInitialState(extraState);
export type CategoryState = typeof initialState;

// Thunks
interface RejectValue {
    status: number;
    message: any;
}

export const getCategories = createAsyncThunk<
    Category[],
    void,
    { rejectValue: RejectValue; dispatch: AppDispatch }
>(`${categoryReducerName}/getCategories`, async (_, { dispatch, rejectWithValue }) => {
    try {
        const categories: Category[] = [];
        let data: APIListResponse<Category> | undefined = undefined;

        let path: string = "/api/hardware/categories/";
        let params: { [key: string]: any } = {};

        do {
            const response = await get<APIListResponse<Category>>(path, params);
            data = response.data;
            if (data?.next) {
                const nextURLData = stripHostnameReturnFilters(data.next);
                path = nextURLData.path;
                params = nextURLData.filters ?? {};
            }
            categories.push(...data.results);
        } while (data?.next);

        return categories;
    } catch (e: any) {
        dispatch(
            displaySnackbar({
                message: `Failed to fetch category data: Error ${e.response.status}`,
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
const categorySlice = createSlice({
    name: categoryReducerName,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getCategories.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });

        builder.addCase(getCategories.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.error = null;
            categoryAdapter.setAll(state, payload);
        });

        builder.addCase(getCategories.rejected, (state, { payload }) => {
            state.isLoading = false;
            state.error = payload?.message || "Something went wrong";
        });
    },
});

export const { reducer } = categorySlice;
export default reducer;

// Selectors
export const categorySliceSelector = (state: RootState) => state[categoryReducerName];

export const categorySelectors = categoryAdapter.getSelectors(categorySliceSelector);

export const isLoadingSelector = createSelector(
    [categorySliceSelector],
    (categorySlice) => categorySlice.isLoading
);

export const selectCategoriesByIds = createSelector(
    [categorySelectors.selectEntities, (state: RootState, ids: number[]) => ids],
    (entities, ids) => ids.map((id) => entities?.[id])
);
