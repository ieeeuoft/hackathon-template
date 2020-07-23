import React from "react";
import { render } from "@testing-library/react";
import Navbar from "./Navbar";
import { styles } from "./Navbar.module.scss";
import { withStoreAndRouter } from "testing/helpers";
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
});
