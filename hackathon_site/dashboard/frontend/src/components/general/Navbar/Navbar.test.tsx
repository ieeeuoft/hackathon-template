import React from "react";

import { fireEvent, render } from "testing/utils";

import Navbar, { UnconnectedNavbar } from "./Navbar";
import styles from "./Navbar.module.scss";
import { cartQuantity, mockCartItems } from "testing/mockData";

describe("<Navbar />", () => {
    const pagesAndPaths = [
        ["Dashboard", "/"],
        ["Orders", "/orders"],
        ["Teams", "/teams"],
        ["Reports", "/reports"],
        ["Inventory", "/inventory"],
        [`Cart (0)`, "/cart"],
    ];

    const handleLogoutSpy = jest.fn();

    pagesAndPaths.map(([label, path]) => {
        it(`Adds the active class to ${label} when on ${path}`, () => {
            const { getByText, container } = render(
                <UnconnectedNavbar
                    cartQuantity={cartQuantity}
                    pathname={path}
                    logout={handleLogoutSpy}
                />
            );

            expect(getByText(label).closest("button")!.className).toMatch(
                new RegExp(styles.navActive)
            );

            expect(container.querySelectorAll(".navActive").length).toBe(1);
        });
    });

    test("logout function is called when logout button is clicked", () => {
        const handleLogoutSpy = jest.fn();

        const { getByText } = render(
            <UnconnectedNavbar
                cartQuantity={cartQuantity}
                pathname={"/"}
                logout={handleLogoutSpy}
            />
        );

        // click logout button
        const logOutButton = getByText("Logout").closest("button");
        fireEvent.click(logOutButton!);

        // confirm that handler function was called
        expect(handleLogoutSpy).toHaveBeenCalledTimes(1);
    });
});
