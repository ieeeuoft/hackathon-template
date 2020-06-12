import React from "react";
import { render } from "@testing-library/react";
import Inventory from "./Inventory";
import { withRouter } from "testing";

test("renders without crashing", () => {
    const { getByText } = render(withRouter(<Inventory />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
