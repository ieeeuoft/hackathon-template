import React from "react";
import { render } from "@testing-library/react";
import Inventory from "./Inventory";
import { withRouter, withStore } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withStore(withRouter(<Inventory />)));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
