import React from "react";
import { render } from "@testing-library/react";
import Teams from "./Teams";
import { withRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withRouter(<Teams />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
