import React from "react";
import { render, waitFor } from "@testing-library/react";
import CartSummary from "components/cart/CartSummary/CartSummary";
import { cartQuantity } from "testing/mockData";
import store from "slices/store";
import { Provider } from "react-redux";

describe("Render cartQuantity", () => {
    it(`Renders correctly when it reads the number ${cartQuantity}`, async () => {
        const { getByText } = render(
            <Provider store={store}>
                <CartSummary />
            </Provider>
        );
        await waitFor(() => {
            expect(getByText(cartQuantity.toString())).toBeInTheDocument();
        });
    });
});
