import store, { makeStore, RootState } from "slices/store";
import {
    addToCart,
    cartReducerName,
    cartSelectors,
    cartSliceSelector,
    isLoadingSelector,
    initialState,
    removeFromCart,
} from "slices/hardware/cartSlice";
import { waitFor } from "testing/utils";

const mockState: RootState = {
    ...store.getState(),
    [cartReducerName]: initialState,
};

describe("Selectors", () => {
    test("cartSliceSelector returns the cart store", () => {
        expect(cartSliceSelector(mockState)).toEqual(mockState[cartReducerName]);
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = {
            ...mockState,
            [cartReducerName]: {
                ...initialState,
                isLoading: true,
            },
        };
        const loadingFalseState = {
            ...mockState,
            [cartReducerName]: {
                ...initialState,
                isLoading: false,
            },
        };

        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });
});

describe("addToCart action", () => {
    test("addToCart with new items", async () => {
        const store = makeStore();

        store.dispatch(addToCart({ hardware_id: 1, quantity: 2 }));

        store.dispatch(addToCart({ hardware_id: 2, quantity: 3 }));

        await waitFor(() => {
            expect(cartSelectors.selectIds(store.getState())).toEqual([1, 2]);
            expect(cartSelectors.selectById(store.getState(), 1)).toEqual({
                hardware_id: 1,
                quantity: 2,
            });
            expect(cartSelectors.selectById(store.getState(), 2)).toEqual({
                hardware_id: 2,
                quantity: 3,
            });
        });
    });

    test("addToCart updates existing item", async () => {
        const store = makeStore();

        store.dispatch(addToCart({ hardware_id: 1, quantity: 2 }));
        store.dispatch(addToCart({ hardware_id: 2, quantity: 3 }));
        store.dispatch(addToCart({ hardware_id: 1, quantity: 3 }));

        await waitFor(() => {
            expect(cartSelectors.selectIds(store.getState())).toEqual([1, 2]);
            expect(cartSelectors.selectById(store.getState(), 1)).toEqual({
                hardware_id: 1,
                quantity: 5,
            });
            expect(cartSelectors.selectById(store.getState(), 2)).toEqual({
                hardware_id: 2,
                quantity: 3,
            });
        });
    });
});

describe("removeFromCart action", () => {
    test("removeFromCart removes existing item", async () => {
        const store = makeStore();

        store.dispatch(addToCart({ hardware_id: 2, quantity: 1 }));

        store.dispatch(removeFromCart(2));
        store.dispatch(addToCart({ hardware_id: 2, quantity: 5 }));

        await waitFor(() => {
            expect(cartSelectors.selectAll(store.getState()).length).toEqual(1);
            expect(cartSelectors.selectById(store.getState(), 2)).toEqual({
                hardware_id: 2,
                quantity: 5,
            });
        });
    });
});
