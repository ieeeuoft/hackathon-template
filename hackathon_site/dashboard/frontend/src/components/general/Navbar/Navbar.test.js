import React from "react";
import { render } from "@testing-library/react";
import Navbar from "./Navbar";
import { withRouter } from "testing";

it("renders correctly when all icons appear", () => {
    const { asFragment } = render(withRouter(<Navbar />));
    expect(asFragment()).toMatchSnapshot();
});
