import React from "react";
import DashCard from "./DashCard";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

/** Testing the DashCard
 *  1. Does it render? Snapshot testing
 *  2. Does the hover effect work?
 *  3. does the clicking and the link work?
 *  4. Does the Icon component passed in render?
 *
 */

describe("DashCard", () => {
    const testTitle = "any string";
    const testContent = [
        {
            name: "testing",
            url: "https://jestjs.io/docs/en/getting-started",
            icon: null,
        },
        { name: "testing", url: "youtube", icon: null },
    ];

    test("render", () => {
        const { asFragment } = render(
            <DashCard title={testTitle} content={testContent} />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
