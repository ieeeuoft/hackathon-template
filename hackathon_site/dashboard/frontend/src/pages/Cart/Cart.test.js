import React from "react";
import { render } from "@testing-library/react";
import Cart from "./Cart";
import { withStoreAndRouter } from "testing/helpers";

import { cartItems } from "testing/mockData";

test("Cart items and Cart Summary card appears", () => {
    const { getByText } = render(withStoreAndRouter(<Cart />));

    for (let e of cartItems) {
        expect(getByText(e.title)).toBeInTheDocument();
    }
    expect(getByText("Cart Summary")).toBeInTheDocument();
});
