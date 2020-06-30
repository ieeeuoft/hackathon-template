import React from "react";
import { render } from "@testing-library/react";
import Teams from "./Teams";
import { withRouter, withStore } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withStore(withRouter(<Teams />)));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
