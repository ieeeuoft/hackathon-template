import React from "react";
import { render } from "@testing-library/react";
import TitledPaper from "./TitledPaper";

describe("<TitledPaper />", () => {
    const titleTest = "Test title";
    const childTest = "Test child";

    it("renders text given to it and title appears", () => {
        const { getByText, getByTestId } = render(
            <TitledPaper title={titleTest}>{childTest}</TitledPaper>
        );
        expect(getByTestId("titledPaperTitle")).toBeInTheDocument();
        expect(getByText(titleTest)).toBeInTheDocument();
        expect(getByText(childTest)).toBeInTheDocument();
    });
    it("does not render title if not given anything", () => {
        const { queryByTestId } = render(<TitledPaper />);
        expect(queryByTestId("titledPaperTitle")).not.toBeInTheDocument();
    });
});
