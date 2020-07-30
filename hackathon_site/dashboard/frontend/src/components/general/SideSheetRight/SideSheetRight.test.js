import React from "react";
import SideSheetRight from "./SideSheetRight";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("SideSheetRight", () => {
    test("title is displayed", () => {
        const titleTest = "random";

        const { getByText } = render(
            <SideSheetRight title={titleTest} isVisible={true} />
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
    test("handleClose function is called when the return allow is clicked", () => {
        const handleCloseMock = jest.fn();

        const { getByRole } = render(
            <SideSheetRight
                title="title"
                isVisible={true}
                handleClose={handleCloseMock}
            />
        );

        // close the sidesheetright
        const backArrow = getByRole("close");
        fireEvent.click(backArrow);

        // confirm the mock handler function was called
        expect(handleCloseMock).toHaveBeenCalledTimes(1);
    });
});
