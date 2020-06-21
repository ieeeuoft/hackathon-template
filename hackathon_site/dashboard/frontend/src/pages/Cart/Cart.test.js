import React from "react";
import { render } from "@testing-library/react";
import Cart from "./Cart";
import { withRouter } from "testing";

test("renders without crashing", () => {
    const { getByText } = render(withRouter(<Cart />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
