import React from "react";

import { fireEvent, render } from "testing/utils";

import { UnconnectedNavbar } from "./Navbar";
import styles from "./Navbar.module.scss";

describe("<Navbar />", () => {
    const handleLogoutSpy = jest.fn();

    const pagesAndPaths = [
        ["Dashboard", "/"],
        ["Orders", "/orders"],
        ["Teams", "/teams"],
        ["Reports", "/reports"],
        ["Inventory", "/inventory"],
        [`Cart (0)`, "/cart"],
    ];

    pagesAndPaths.map(([label, path]) => {
        it(`Adds the active class to ${label} when on ${path}`, () => {
            const { getByText, container } = render(
                <UnconnectedNavbar pathname={path} logout={handleLogoutSpy} />
            );

            expect(getByText(label).closest("button")?.className).toMatch(
                new RegExp(styles.navActive)
            );

            expect(container.querySelectorAll(".navActive").length).toBe(1);
        });
    });

    test("logout function is called when logout button is clicked", () => {
        const { getByText } = render(
            <UnconnectedNavbar pathname={"/"} logout={handleLogoutSpy} />
        );

        // click logout button
        const logOutButton = getByText("Logout");
        fireEvent.click(logOutButton);

        // confirm that handler function was called
        expect(handleLogoutSpy).toHaveBeenCalledTimes(1);
    });
});
