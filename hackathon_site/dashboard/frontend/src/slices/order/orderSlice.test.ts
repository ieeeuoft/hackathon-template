import store, { makeStore, RootState } from "slices/store";
import {
    orderReducerName,
    orderSelectors,
    orderSliceSelector,
    isLoadingSelector,
    initialState,
} from "./orderSlice";

const mockState: RootState = {
    ...store.getState(),
    [orderReducerName]: initialState,
};

describe("Selectors", () => {
    test("teamSliceSelector returns the team store", () => {
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
});
