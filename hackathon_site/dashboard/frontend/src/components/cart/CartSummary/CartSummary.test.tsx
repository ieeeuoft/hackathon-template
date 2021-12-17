import React from "react";
import { render, waitFor } from "@testing-library/react";
import CartSummary from "components/cart/CartSummary/CartSummary";
import { cartQuantity, mockCartItems } from "testing/mockData";
import store, { makeStore, RootState } from "slices/store";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";
import {
    initialState,
    cartReducerName,
    submitOrder,
    cartSliceSelector,
} from "slices/hardware/cartSlice";
import { post } from "api/api";
import { displaySnackbar } from "slices/ui/uiSlice";
import { makeMockApiListResponse } from "testing/utils";
import { AnyAction } from "redux";

it(`Renders correctly when it reads the number ${cartQuantity}`, async () => {
    const store = makeStore();
    const { getByText } = render(
        <Provider store={store}>
            <CartSummary cartQuantity={cartQuantity} />
        </Provider>
    );
    await waitFor(() => {
        expect(getByText(cartQuantity.toString())).toBeInTheDocument();
    });
});

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    post: jest.fn(),
}));

const mockedPost = post as jest.MockedFunction<typeof post>;

const mockState: RootState = {
    ...store.getState(),
    [cartReducerName]: initialState,
};

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

describe("Selectors", () => {
    test("cartSliceSelector returns the cart store", () => {
        expect(cartSliceSelector(mockState)).toEqual(mockState[cartReducerName]);
    });
});

describe("submitOrder Thunk and Reducer", () => {
    test("Updates the store on API success", async () => {
        const response = makeMockApiListResponse(mockCartItems);
        mockedPost.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(submitOrder(null));

        await waitFor(() => {
            expect(mockedPost).toBeCalledWith("/api/hardware/orders/", {
                hardware: [],
            });
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
        await store.dispatch(submitOrder(null));

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
        await store.dispatch(submitOrder(null));

        expect(cartSliceSelector(store.getState())).toHaveProperty(
            "error",
            failureResponse.response.message
        );
    });
});
