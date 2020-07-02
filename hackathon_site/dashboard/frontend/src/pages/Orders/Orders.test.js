import React from "react";
import { render } from "@testing-library/react";
import Orders from "./Orders";
import { withStoreAndRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withStoreAndRouter(<Orders />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
