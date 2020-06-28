import React from "react";
import { render } from "@testing-library/react";
import Navbar from "./Navbar";
import { withRouter } from "testing/helpers";

describe("<Navbar />", () => {
    it("renders correctly when all icons appear", () => {
        const { asFragment } = render(withRouter(<Navbar cartQuantity={1} />));
        expect(asFragment()).toMatchSnapshot();
    });
});
