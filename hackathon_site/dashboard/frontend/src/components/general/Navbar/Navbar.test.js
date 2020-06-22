import React from "react";
import { render } from "@testing-library/react";
import { Navbar, NavbarDrawer } from "./Navbar";
import { withRouter } from "testing";

describe("<Navbar />", () => {
    it("renders correctly when all icons appear", () => {
        const { getByText } = render(withRouter(<Navbar cartQuantity={1}/>));
        expect(getByText("Dashboard")).toBeInTheDocument();
        expect(getByText("Logout")).toBeInTheDocument();
        expect(getByText("Cart (1)")).toBeInTheDocument();
        expect(getByText("Notifications")).toBeInTheDocument();
    });
});

describe("<NavbarDrawer />", () => {
    it("renders correctly when cart and notification don't appear", () => {
        const { getByText, queryByText } = render(withRouter(<NavbarDrawer />));
        expect(getByText("Dashboard")).toBeInTheDocument();
        expect(getByText("Logout")).toBeInTheDocument();
        expect(queryByText("Cart ()")).not.toBeInTheDocument();
        expect(queryByText("Notifications")).not.toBeInTheDocument();
    });
});
