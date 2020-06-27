import React from "react";
import { render } from "@testing-library/react";
import NotFound from "./NotFound";
import { withRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withRouter(<NotFound />));
    expect(getByText("Error 404")).toBeInTheDocument();
});
