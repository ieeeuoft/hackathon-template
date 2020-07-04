import configureStore from "redux-mock-store";

import {
    uiSelector,
    isCheckedOutTableVisibleSelector,
    isReturnedTableVisibleSelector,
    initialState,
    uiReducerName,
    reducer,
    actions,
} from "./uiSlice";

const mockState = {
    [uiReducerName]: initialState,
};

describe("Selectors", () => {
    test("uiSelector returns the ui store", () => {
        expect(uiSelector(mockState)).toEqual(mockState[uiReducerName]);
    });

    test("isCheckedOutTableVisibleSelector", () => {
        expect(isCheckedOutTableVisibleSelector(mockState)).toEqual(
            mockState[uiReducerName].dashboard.isCheckedOutTableVisible
        );
    });

    test("isReturnedTableVisibleSelector", () => {
        expect(isReturnedTableVisibleSelector(mockState)).toEqual(
            mockState[uiReducerName].dashboard.isReturnedTableVisible
        );
    });
});

describe("Reducers", () => {
    const checkedOutVisibility = (uiState) =>
        uiState.dashboard.isCheckedOutTableVisible;
    const returnedVisibility = (uiState) => uiState.dashboard.isReturnedTableVisible;

    it("Toggles the checked out table visibility", () => {
        const initialVisibility = checkedOutVisibility(initialState);
        const toggledState = reducer(
            initialState,
            actions.toggleCheckedOutTable(undefined)
        );
        expect(checkedOutVisibility(toggledState)).toEqual(!initialVisibility);

        const toggledAgainState = reducer(
            toggledState,
            actions.toggleCheckedOutTable(undefined)
        );
        expect(checkedOutVisibility(toggledAgainState)).toEqual(initialVisibility);
    });

    it("Toggles the returned table visibility", () => {
        const initialVisibility = returnedVisibility(initialState);
        const toggledState = reducer(
            initialState,
            actions.toggleReturnedTable(undefined)
        );
        expect(returnedVisibility(toggledState)).toEqual(!initialVisibility);

        const toggledAgainState = reducer(
            toggledState,
            actions.toggleReturnedTable(undefined)
        );
        expect(returnedVisibility(toggledAgainState)).toEqual(initialVisibility);
    });
});
