import React from "react";
import SideSheetRight from "./SideSheetRight";
import {
    render,
    fireEvent,
    waitForElementToBeRemoved,
    waitFor,
    waitForElement,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// test uf tge cgukdreb us displayed
// test if the tile is displayed
// test for visibility after react is connected to redux store

describe("SideSheetRight", () => {
    test("title is displayed", () => {
        const titleTest = "random";

        const { getByText } = render(
            <SideSheetRight title={titleTest} isVisible={true}></SideSheetRight>
        );

        expect(getByText(titleTest)).toBeInTheDocument();
    });
    test("children is displayed", () => {
        const childrenTest = <div>children</div>;

        const { getByText } = render(
            <SideSheetRight title="title" isVisible={true}>
                {childrenTest}
            </SideSheetRight>
        );

        expect(getByText("children")).toBeInTheDocument();
    });
});
