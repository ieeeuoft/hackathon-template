import React from "react";
import DashCard from "./DashCard";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

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
