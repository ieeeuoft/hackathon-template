import React from "react";
import { render } from "@testing-library/react";
import NotFound from "./NotFound";
import { withStoreAndRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withStoreAndRouter(<NotFound />));
    expect(getByText("Error 404")).toBeInTheDocument();
});
