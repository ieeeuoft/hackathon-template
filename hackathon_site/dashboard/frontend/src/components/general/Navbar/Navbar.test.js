import React from "react";
import { render } from "@testing-library/react";
import { Navbar, NavbarDrawer } from "./Navbar";
import { withRouter } from "testing";

describe("<Navbar />", () => {
    it("renders correctly when all icons appear", () => {
        const { asFragment } = render(withRouter(<Navbar cartQuantity={1} unreadNotificationQuantity={1}/>));
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly when all icons appear but no badge on notification iconon mobile", () => {
        const { asFragment } = render(withRouter(<Navbar cartQuantity={0} unreadNotificationQuantity={0}/>));
        expect(asFragment()).toMatchSnapshot();
    });
});

describe("<NavbarDrawer />", () => {
    it("renders correctly when cart and notification don't appear", () => {
        const { asFragment } = render(withRouter(<NavbarDrawer />));
        expect(asFragment()).toMatchSnapshot();
    });
});
