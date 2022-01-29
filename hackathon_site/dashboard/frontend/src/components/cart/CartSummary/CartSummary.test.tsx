import React from "react";
import { render, waitFor } from "@testing-library/react";
import CartSummary from "components/cart/CartSummary/CartSummary";
import { cartQuantity, mockCartItems } from "testing/mockData";
import store, { makeStore, RootState } from "slices/store";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";
import { initialState, cartReducerName } from "slices/hardware/cartSlice";
import { post } from "api/api";
import { fireEvent, makeMockApiListResponse, when } from "testing/utils";
import { AnyAction } from "redux";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    post: jest.fn(),
}));

const mockedPost = post as jest.MockedFunction<typeof post>;
const orderUri = "/api/hardware/orders/";

const mockState: RootState = {
    ...store.getState(),
    [cartReducerName]: initialState,
};

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

describe("Render cartQuantity", () => {
    it(`Renders correctly when it reads the number ${cartQuantity}`, async () => {
        const store = makeStore();
        const { getByText } = render(
            <Provider store={store}>
                <CartSummary />
            </Provider>
        );
        await waitFor(() => {
            expect(getByText(cartQuantity.toString())).toBeInTheDocument();
        });
    });
    test("Checks for correct POST request", async () => {
        const response = makeMockApiListResponse(mockCartItems);

        when(mockedPost).calledWith(orderUri, {}).mockResolvedValue(response);

        const store = mockStore(mockState);
        const { getByTestId } = render(
            <Provider store={store}>
                <CartSummary />
            </Provider>
        );

        const submitOrderBtn = getByTestId("submit-order-button");

        fireEvent.click(submitOrderBtn);

        await waitFor(() => {
            expect(getByTestId("cart-quantity-total")).toHaveTextContent("0");
        });
    });
});
