import React from "react";

import { render } from "testing/utils";

import NotFound from "./NotFound";

test("renders without crashing", () => {
    const { getByText } = render(<NotFound />);
    expect(getByText("Error 404")).toBeInTheDocument();
});
