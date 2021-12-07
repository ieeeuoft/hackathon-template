import React from "react";
import { render, waitFor } from "@testing-library/react";
import CartSummary from "./CartSummary";
import { cartQuantity } from "testing/mockData";
import { makeStore } from "slices/store";
import { Provider } from "react-redux";

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
