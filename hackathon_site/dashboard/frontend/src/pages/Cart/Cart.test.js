import React from "react";

import { render } from "testing/utils";

import Cart from "pages/Cart/Cart";

import { cartItems } from "testing/mockData";

test("Cart items and Cart Summary card appears", () => {
    const { getByText } = render(<Cart />);

    for (let e of cartItems) {
        expect(getByText(e.title)).toBeInTheDocument();
    }
    expect(getByText("Cart Summary")).toBeInTheDocument();
});
