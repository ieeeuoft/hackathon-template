import store, { makeStore, RootState } from "slices/store";
import {
    orderReducerName,
    orderSliceSelector,
    isLoadingSelector,
    orderErrorSelector,
    initialState,
} from "slices/order/orderSlice";

const mockState: RootState = {
    ...store.getState(),
    [orderReducerName]: initialState,
};

describe("Selectors", () => {
    test("orderSliceSelector returns the team store", () => {
        expect(orderSliceSelector(mockState)).toEqual(mockState[orderReducerName]);
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [orderReducerName]: {
                ...initialState,
                isLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [orderReducerName]: {
                ...initialState,
                isLoading: false,
            },
        };
        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("orderErrorSelector", () => {
        const errorExistsState = {
            ...mockState,
            [orderReducerName]: {
                ...initialState,
                error: "exists",
            },
        };
        const errorNullState = {
            ...mockState,
            [orderReducerName]: {
                ...initialState,
                error: null,
            },
        };
        expect(orderErrorSelector(errorExistsState)).toEqual("exists");
        expect(orderErrorSelector(errorNullState)).toEqual(null);
    });
});
