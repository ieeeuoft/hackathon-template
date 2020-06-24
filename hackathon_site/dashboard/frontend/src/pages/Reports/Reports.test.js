import React from "react";
import { render } from "@testing-library/react";
import Reports from "./Reports";
import { withRouter } from "testing";

test("renders without crashing", () => {
    const { getByText } = render(withRouter(<Reports />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
