import configureStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";

import store, { makeStore, RootState } from "slices/store";
import {
    categorySliceSelector,
    categoryReducerName,
    initialState,
    getCategories,
    categorySelectors,
} from "slices/hardware/categorySlice";
import { get, stripHostnameReturnFilters } from "api/api";
import { AnyAction } from "redux";
import { displaySnackbar } from "slices/ui/uiSlice";
import { mockCategories } from "testing/mockData";
import { makeMockApiListResponse, waitFor } from "testing/utils";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;

const mockState: RootState = {
    ...store.getState(),
    [categoryReducerName]: initialState,
};

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

describe("Selectors", () => {
    test("categorySliceSelector returns the category store", () => {
        expect(categorySliceSelector(mockState)).toEqual(
            mockState[categoryReducerName]
        );
    });
});

describe("getCategories thunk", () => {
    it("Updates the store on API success", async () => {
        const response = makeMockApiListResponse(mockCategories);
        mockedGet.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(getCategories());

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/hardware/categories/", {});
            expect(categorySelectors.selectIds(store.getState())).toEqual(
                mockCategories.map(({ id }) => id)
            );
        });
    });
    it("Dispatches a snackbar on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Something went wrong",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = mockStore(mockState);
        await store.dispatch(getCategories());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Failed to fetch category data: Error 500",
                options: { variant: "error" },
            })
        );
    });

    it("Updates the store on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Something went wrong",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = makeStore();
        await store.dispatch(getCategories());

        expect(categorySliceSelector(store.getState())).toHaveProperty(
            "error",
            failureResponse.response.message
        );
    });

    it("Exhaustively traverses the paginated API", async () => {
        const next =
            "http://localhost:8000/api/hardware/categories/?limit=100&offset=100";
        const apiResponse1 = makeMockApiListResponse(
            mockCategories.slice(0, 2),
            next,
            null,
            4
        );

        const apiResponse2 = makeMockApiListResponse(
            mockCategories.slice(2, 4),
            null,
            null,
            4
        );

        const { path: nextPath, filters } = stripHostnameReturnFilters(next);

        mockedGet
            .mockResolvedValueOnce(apiResponse1)
            .mockResolvedValueOnce(apiResponse2);

        const store = makeStore();
        await store.dispatch(getCategories());

        const categories = categorySelectors.selectAll(store.getState());
        expect(categories).toEqual(categories.slice(0, 4));

        expect(mockedGet).toHaveBeenCalledTimes(2);
        expect(mockedGet).toHaveBeenCalledWith("/api/hardware/categories/", {});
        expect(mockedGet).toHaveBeenCalledWith(nextPath, filters);
    });
});
