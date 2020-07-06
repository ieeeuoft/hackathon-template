import React from "react";
import { render } from "@testing-library/react";
import CartSummary from "./CartSummary";
import { cartQuantity } from "testing/mockData";

it(`Renders correctly when it reads the number ${cartQuantity}`, () => {
    const { asFragment, getByText } = render(
        <CartSummary cartQuantity={cartQuantity} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByText(cartQuantity.toString())).toBeInTheDocument();
});
