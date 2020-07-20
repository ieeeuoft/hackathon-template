import {
    uiSelector,
    isCheckedOutTableVisibleSelector,
    isReturnedTableVisibleSelector,
    snackbarSelector,
    initialState,
    uiReducerName,
    reducer,
    toggleCheckedOutTable,
    toggleReturnedTable,
    displaySnackbar,
    dismissSnackbar,
    removeSnackbar,
} from "./uiSlice";

describe("Selectors", () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            [uiReducerName]: {
                ...initialState,
                snackbars: [{ message: "Hi there", options: { key: 123456 } }],
            },
        };
    });

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

    test("snackbarSelector", () => {
        expect(snackbarSelector(mockState)).toEqual(mockState[uiReducerName].snackbars);
    });
});

describe("Reducers", () => {
    const checkedOutVisibility = (uiState) =>
        uiState.dashboard.isCheckedOutTableVisible;
    const returnedVisibility = (uiState) => uiState.dashboard.isReturnedTableVisible;

    let mockUiState;
    beforeEach(() => {
        mockUiState = {
            ...initialState,
            snackbars: [
                { message: "I am first", options: { key: 1 }, dismissed: false },
                { message: "I am second", options: { key: 2 }, dismissed: false },
            ],
        };
    });

    test("toggleCheckedOutTable() toggles the checked out table visibility", () => {
        const initialVisibility = checkedOutVisibility(mockUiState);
        const toggledState = reducer(mockUiState, toggleCheckedOutTable(undefined));
        expect(checkedOutVisibility(toggledState)).toEqual(!initialVisibility);

        const toggledAgainState = reducer(
            toggledState,
            toggleCheckedOutTable(undefined)
        );
        expect(checkedOutVisibility(toggledAgainState)).toEqual(initialVisibility);
    });

    test("toggleReturnedTable() toggles the returned table visibility", () => {
        const initialVisibility = returnedVisibility(mockUiState);
        const toggledState = reducer(mockUiState, toggleReturnedTable(undefined));
        expect(returnedVisibility(toggledState)).toEqual(!initialVisibility);

        const toggledAgainState = reducer(toggledState, toggleReturnedTable(undefined));
        expect(returnedVisibility(toggledAgainState)).toEqual(initialVisibility);
    });

    test("displaySnackbar() enqueues a new snackbar with provided options", () => {
        const message = "Hi there";
        const options = {
            variant: "error",
            key: 123456,
        };
        mockUiState.snackbars = [];

        const enqueuedState = reducer(
            mockUiState,
            displaySnackbar({ message, options })
        );

        expect(enqueuedState.snackbars).toEqual([
            {
                message,
                options,
                dismissed: false,
            },
        ]);
    });

    test("displaySnackbar() enqueues a new snackbar with default options", () => {
        const key = 0.45526621894095487;
        jest.spyOn(global.Math, "random").mockReturnValue(key);
        const message = "Hi there";
        mockUiState.snackbars = [];

        const enqueuedState = reducer(mockUiState, displaySnackbar({ message }));

        expect(enqueuedState.snackbars).toEqual([
            {
                message,
                options: {
                    key,
                },
                dismissed: false,
            },
        ]);

        global.Math.random.mockRestore();
    });

    test("dismissSnackbar() marks the snack with the right key as dismissed", () => {
        const dismissedState = reducer(mockUiState, dismissSnackbar({ key: 1 }));

        dismissedState.snackbars.map((snackbar) => {
            expect(snackbar.dismissed).toBe(snackbar.options.key === 1);
        });
    });

    test("dismissSnackbar() marks all snacks as dismissed if not given a key", () => {
        const dismissedState = reducer(mockUiState, dismissSnackbar({}));

        dismissedState.snackbars.map((snackbar) => {
            expect(snackbar.dismissed).toBe(true);
        });
    });

    test("removeSnackbar() removes the snackbar with the right key from the store", () => {
        const removedState = reducer(mockUiState, removeSnackbar({ key: 1 }));

        expect(removedState.snackbars).toEqual([mockUiState.snackbars[1]]);
    });
});
