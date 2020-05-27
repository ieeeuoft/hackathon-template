import React from "react";
import { render } from "@testing-library/react";
import Dashboard from "./Dashboard";

it("renders correctly when the dashboard appears with the sponsor card", () => {
    const { asFragment } = render(<Dashboard />);
    expect(asFragment()).toMatchSnapshot();
});
