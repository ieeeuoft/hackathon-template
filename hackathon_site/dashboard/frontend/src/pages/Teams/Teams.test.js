import React from "react";

import { render } from "testing/utils";

import Teams from "./Teams";

test("renders without crashing", () => {
    const { getByText } = render(<Teams />);
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
