import {
    uiSliceSelector,
    isCheckedOutTableVisibleSelector,
    isReturnedTableVisibleSelector,
    isPendingTableVisibleSelector,
    snackbarSelector,
    initialState,
    uiReducerName,
    toggleCheckedOutTable,
    toggleReturnedTable,
    togglePendingTable,
    displaySnackbar,
    dismissSnackbar,
    removeSnackbar,
    UIState,
} from "./uiSlice";
import { makeStore, RootStore } from "../store";

describe("Selectors", () => {
    let store: RootStore;
    const initialUIState: UIState = {
        ...initialState,
        snackbars: [
            { message: "Hi there", options: { key: 123456 }, dismissed: false },
        ],
    };

    beforeEach(() => {
        store = makeStore({
            [uiReducerName]: initialUIState,
        });
    });

    test("uiSelector returns the ui store", () => {
        expect(uiSliceSelector(store.getState())).toEqual(initialUIState);
    });

    test("isCheckedOutTableVisibleSelector", () => {
        expect(isCheckedOutTableVisibleSelector(store.getState())).toEqual(
            initialUIState.dashboard.isCheckedOutTableVisible
        );
    });

    test("isPendingTableVisibleSelector", () => {
        expect(isPendingTableVisibleSelector(store.getState())).toEqual(
            initialUIState.dashboard.isPendingTableVisible
        );
    });

    test("isReturnedTableVisibleSelector", () => {
        expect(isReturnedTableVisibleSelector(store.getState())).toEqual(
            initialUIState.dashboard.isReturnedTableVisible
        );
    });

    test("snackbarSelector", () => {
        expect(snackbarSelector(store.getState())).toEqual(initialUIState.snackbars);
    });
});

describe("Reducers", () => {
    let store: RootStore;
    const initialUIState: UIState = {
        ...initialState,
        snackbars: [
            { message: "I am first", options: { key: 1 }, dismissed: false },
            { message: "I am second", options: { key: 2 }, dismissed: false },
        ],
    };

    beforeEach(() => {
        store = makeStore({
            [uiReducerName]: initialUIState,
        });
    });

    test("toggleCheckedOutTable() toggles the checked out table visibility", () => {
        const initialVisibility = initialUIState.dashboard.isCheckedOutTableVisible;

        store.dispatch(toggleCheckedOutTable());
        expect(isCheckedOutTableVisibleSelector(store.getState())).toEqual(
            !initialVisibility
        );

        store.dispatch(toggleCheckedOutTable());
        expect(isCheckedOutTableVisibleSelector(store.getState())).toEqual(
            initialVisibility
        );
    });

    test("toggleReturnedTable() toggles the returned table visibility", () => {
        const initialVisibility = initialUIState.dashboard.isReturnedTableVisible;

        store.dispatch(toggleReturnedTable());
        expect(isReturnedTableVisibleSelector(store.getState())).toEqual(
            !initialVisibility
        );

        store.dispatch(toggleReturnedTable());
        expect(isReturnedTableVisibleSelector(store.getState())).toEqual(
            initialVisibility
        );
    });

    test("togglePendingTable() toggles the Pending table visibility", () => {
        const initialVisibility = initialUIState.dashboard.isPendingTableVisible;

        store.dispatch(togglePendingTable());
        expect(isPendingTableVisibleSelector(store.getState())).toEqual(
            !initialVisibility
        );

        store.dispatch(togglePendingTable());
        expect(isPendingTableVisibleSelector(store.getState())).toEqual(
            initialVisibility
        );
    });

    test("displaySnackbar() enqueues a new snackbar with provided options", () => {
        const message = "Hi there";
        const options = {
            variant: "error",
            key: 123456,
        };

        store.dispatch(displaySnackbar({ message, options }));
        expect(snackbarSelector(store.getState())).toEqual([
            ...initialUIState.snackbars,
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

        store.dispatch(displaySnackbar({ message }));
        expect(snackbarSelector(store.getState())).toEqual([
            ...initialUIState.snackbars,
            {
                message,
                options: {
                    key,
                },
                dismissed: false,
            },
        ]);
    });

    test("dismissSnackbar() marks the snack with the right key as dismissed", () => {
        store.dispatch(dismissSnackbar({ key: 1 }));
        snackbarSelector(store.getState()).map((snackbar) =>
            expect(snackbar.dismissed).toBe(snackbar.options.key === 1)
        );
    });

    test("dismissSnackbar() marks all snacks as dismissed if not given a key", () => {
        store.dispatch(dismissSnackbar({}));
        snackbarSelector(store.getState()).map((snackbar) =>
            expect(snackbar.dismissed).toBe(true)
        );
    });

    test("removeSnackbar() removes the snackbar with the right key from the store", () => {
        store.dispatch(removeSnackbar({ key: 1 }));
        expect(snackbarSelector(store.getState())).toEqual([
            initialUIState.snackbars[1],
        ]);
    });
});
