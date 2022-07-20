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
    OrderResponse,
} from "slices/hardware/cartSlice";
import { makeStoreWithEntities, waitFor } from "testing/utils";
import { mockCartItems } from "testing/mockData";
import { displaySnackbar } from "slices/ui/uiSlice";
import { post } from "api/api";
import thunk, { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import configureStore from "redux-mock-store";
import { AxiosResponse } from "axios";

const mockState: RootState = {
    ...store.getState(),
    [cartReducerName]: initialState,
};

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    post: jest.fn(),
}));

const mockedPost = post as jest.MockedFunction<typeof post>;

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

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

describe("submitOrder Thunk and Reducer", () => {
    const limitErrors = [
        "Limit for Category Microcontrollers is reached",
        "Limit for Hardware Arduino Uno is reached",
    ];

    const apiFailureResponse = {
        response: {
            status: 500,
            message: "Something went wrong",
        },
    };

    const orderFailureResponse = {
        response: {
            status: 400,
            data: {
                non_field_errors: limitErrors,
            },
        },
    };

    const orderFulfillmentFailureResponse: AxiosResponse<OrderResponse> = {
        config: {},
        headers: {},
        status: 200,
        statusText: "OK",
        data: {
            order_id: 1,
            hardware: [
                {
                    hardware_id: 1,
                    quantity_fulfilled: 3,
                },
                {
                    hardware_id: 2,
                    quantity_fulfilled: 1,
                },
                {
                    hardware_id: 3,
                    quantity_fulfilled: 2,
                },
            ],
            errors: [{ hardware_id: 1, message: "No sensors left in inventory" }],
        },
    };

    it("Dispatches a snackbar on API failure", async () => {
        mockedPost.mockRejectedValue(apiFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(submitOrder());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Failed to submit order: Error 500",
                options: { variant: "error" },
            })
        );
    });

    it("Updates the store on API failure", async () => {
        mockedPost.mockRejectedValue(apiFailureResponse);

        const store = makeStore();
        await store.dispatch(submitOrder());

        expect(cartSliceSelector(store.getState())).toHaveProperty(
            "error",
            "Something went wrong"
        );
    });

    it("Dispatches a snackbar on order failure", async () => {
        mockedPost.mockRejectedValue(orderFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(submitOrder());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "There are some problems with your order.",
                options: { variant: "error" },
            })
        );
    });

    it("Updates the store on order failure", async () => {
        mockedPost.mockRejectedValue(orderFailureResponse);

        const store = makeStore();
        await store.dispatch(submitOrder());

        expect(cartSliceSelector(store.getState())).toHaveProperty(
            "error",
            limitErrors
        );
    });

    it("Dispatches a snackbar on order fulfillment error", async () => {
        mockedPost.mockResolvedValueOnce(orderFulfillmentFailureResponse);

        const store = mockStore(mockState);
        await store.dispatch(submitOrder());
        const actions = store.getActions();

        expect(actions).toEqual(
            expect.arrayContaining([
                displaySnackbar({
                    message: "Order has been submitted with modifications",
                    options: { variant: "info" },
                }),
            ])
        );
    });

    it("Updates the store on order failure", async () => {
        mockedPost.mockResolvedValueOnce(orderFulfillmentFailureResponse);

        const store = makeStore();
        await store.dispatch(submitOrder());

        expect(cartSliceSelector(store.getState())).toHaveProperty("fulfillmentError", {
            order_id: orderFulfillmentFailureResponse.data.order_id,
            errors: orderFulfillmentFailureResponse.data.errors,
        });
    });
});
