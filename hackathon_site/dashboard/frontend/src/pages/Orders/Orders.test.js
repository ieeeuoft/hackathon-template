import React from "react";
import { render } from "@testing-library/react";
import Orders from "./Orders";
import { withRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withRouter(<Orders />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
