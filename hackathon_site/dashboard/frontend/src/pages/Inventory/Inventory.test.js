import React from "react";
import { render } from "@testing-library/react";
import Inventory from "./Inventory";
import { withStoreAndRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withStoreAndRouter(<Inventory />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
