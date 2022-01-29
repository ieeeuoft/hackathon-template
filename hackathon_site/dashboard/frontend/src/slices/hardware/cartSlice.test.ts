import store, { makeStore, RootState } from "slices/store";
import {
    addToCart,
    cartReducerName,
    cartSelectors,
    cartSliceSelector,
    isLoadingSelector,
    initialState,
    removeFromCart,
    updateCart,
    submitOrder,
} from "slices/hardware/cartSlice";
import { makeMockApiListResponse, makeStoreWithEntities, waitFor } from "testing/utils";
import { mockCartItems } from "testing/mockData";
import { displaySnackbar } from "../ui/uiSlice";
import { post } from "../../api/api";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";

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

describe("updateCart action", () => {
    test("updateCart updates quantity of existing item", async () => {
        const store = makeStoreWithEntities({
            cartItems: mockCartItems,
        });

        store.dispatch(
            updateCart({ id: mockCartItems[0].hardware_id, changes: { quantity: 25 } })
        );

        await waitFor(() => {
            expect(cartSelectors.selectAll(store.getState()).length).toEqual(
                mockCartItems.length
            );
            expect(cartSelectors.selectById(store.getState(), 1)).toEqual({
                hardware_id: mockCartItems[0].hardware_id,
                quantity: 25,
            });
        });
    });
});

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    post: jest.fn(),
}));

const mockedPost = post as jest.MockedFunction<typeof post>;

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

describe("submitOrder Thunk and Reducer", () => {
    test("Updates the store on API success", async () => {
        const response = makeMockApiListResponse(mockCartItems);
        mockedPost.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(submitOrder());

        await waitFor(() => {
            expect(mockedPost).toBeCalledWith("/api/hardware/orders/", {
                hardware: [],
            });
            // Cart should be empty when the order is submitted
            const cartItems = cartSelectors.selectAll(store.getState());
            expect(cartItems).toEqual([]);
        });
    });

    test("Dispatches a snackbar on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Something went wrong",
            },
        };

        mockedPost.mockRejectedValue(failureResponse);

        const store = mockStore(mockState);
        await store.dispatch(submitOrder());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Failed to fetch hardware data: Error 500",
                options: { variant: "error" },
            })
        );
    });

    it("Updates the store on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Rejected",
            },
        };

        mockedPost.mockRejectedValue(failureResponse);

        const store = makeStore();
        await store.dispatch(submitOrder());

        expect(cartSliceSelector(store.getState())).toHaveProperty(
            "error",
            failureResponse.response.message
        );
    });
});
