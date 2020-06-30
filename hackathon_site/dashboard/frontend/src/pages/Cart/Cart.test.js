import React from "react";
import { render } from "@testing-library/react";
import Cart from "./Cart";
import { withRouter, withStore } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withStore(withRouter(<Cart />)));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
