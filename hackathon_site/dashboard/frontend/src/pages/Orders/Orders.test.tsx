import React from "react";

import { render } from "testing/utils";

import Orders from "./Orders";

test("renders without crashing", () => {
    const { getByText } = render(<Orders />);
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
