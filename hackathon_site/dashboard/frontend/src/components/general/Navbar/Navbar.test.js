import React from "react";
import { fireEvent, render } from "@testing-library/react";
import Navbar, { UnconnectedNavbar } from "./Navbar";
import { styles } from "./Navbar.module.scss";
import { withStoreAndRouter, withRouter } from "testing/helpers";
import { cartQuantity } from "testing/mockData";

describe("<Navbar />", () => {
    const pagesAndPaths = [
        ["Dashboard", "/"],
        ["Orders", "/orders"],
        ["Teams", "/teams"],
        ["Reports", "/reports"],
        ["Inventory", "/inventory"],
        [`Cart (${cartQuantity})`, "/cart"],
    ];

    pagesAndPaths.map(([label, path]) => {
        it(`Adds the active class to ${label} when on ${path}`, () => {
            const { getByText, container } = render(
                withStoreAndRouter(
                    <Navbar cartQuantity={cartQuantity} pathname={path} />
                )
            );

            expect(getByText(label).closest("button").className).toMatch(
                new RegExp(styles.navActive)
            );

            expect(container.querySelectorAll(".navActive").length).toBe(1);
        });
    });

    test("logout function is called when logout button is clicked", () => {
        const handleLogoutSpy = jest.fn();

        const { getByText } = render(
            withRouter(
                <UnconnectedNavbar
                    cartQuantity={cartQuantity}
                    pathname={"/"}
                    logout={handleLogoutSpy}
                />
            )
        );

        // click logout button
        const logOutButton = getByText("Logout").closest("button");
        fireEvent.click(logOutButton);

        // confirm that handler function was called
        expect(handleLogoutSpy).toHaveBeenCalledTimes(1);
    });
});
