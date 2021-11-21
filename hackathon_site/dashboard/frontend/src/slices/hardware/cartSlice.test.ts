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
import { makeStoreWithEntities, waitFor } from "testing/utils";
import { mockCartItems, mockHardware } from "../../testing/mockData";

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
        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
        });

        store.dispatch(removeFromCart(2));

        await waitFor(() => {
            expect(cartSelectors.selectAll(store.getState()).length).toEqual(2);
            expect(cartSelectors.selectById(store.getState(), 1)).toEqual({
                hardware_id: 1,
                quantity: 3,
            });
            expect(cartSelectors.selectById(store.getState(), 3)).toEqual({
                hardware_id: 3,
                quantity: 2,
            });
            expect(cartSelectors.selectById(store.getState(), 2)).toEqual(undefined);
        });
    });
});
