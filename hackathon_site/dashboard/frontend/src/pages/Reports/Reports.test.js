import React from "react";

import { render } from "testing/utils";

import Reports from "./Reports";

test("renders without crashing", () => {
    const { getByText } = render(<Reports />);
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
