import React from "react";
import { render } from "@testing-library/react";
import { HashRouter as Router } from "react-router-dom";
import Navbar from "./Navbar";

it("renders correctly when all icons appear", () => {
    const { asFragment } = render(
        <Router>
            <Navbar />
        </Router>);
    expect(asFragment()).toMatchSnapshot();
});
