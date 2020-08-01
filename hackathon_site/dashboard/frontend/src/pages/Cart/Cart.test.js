import React from "react";
import { render } from "@testing-library/react";
import Cart from "./Cart";
import { withStore, withRouter, withStoreAndRouter } from "testing/helpers";

test("renders without crashing", () => {
    // const { getByText } = render(withStoreAndRouter(<Cart />));
    const { getByText } = render(withStore(withRouter(<Cart />)));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
