import React from "react";
import { render } from "@testing-library/react";
import Reports from "./Reports";
import { withStoreAndRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withStoreAndRouter(<Reports />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
