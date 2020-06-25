import React from "react";
import { render } from "@testing-library/react";
import Navbar from "./Navbar";
import { withRouter } from "testing";

describe("<Navbar />", () => {
    it("renders correctly when all icons appear", () => {
        const { asFragment } = render(
            withRouter(<Navbar cartQuantity={1} unreadNotificationQuantity={1} />)
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly when all icons appear but no badge on notification iconon mobile", () => {
        const { asFragment } = render(
            withRouter(<Navbar cartQuantity={0} unreadNotificationQuantity={0} />)
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
