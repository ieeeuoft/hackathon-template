import React from "react";
import { render } from "@testing-library/react";
import TitledPaper from "./TitledPaper";

describe("<TitledPaper />", () => {
    const titleTest = "Test title";
    const childTest = "Test child";
    it("matches snapshot", () => {
        const { asFragment } = render(
            <TitledPaper title={titleTest}>{childTest}</TitledPaper>
        );
        expect(asFragment()).toMatchSnapshot();
    });
    it("renders text given to it", () => {
        const { getByText } = render(
            <TitledPaper title={titleTest}>{childTest}</TitledPaper>
        );
        expect(getByText(titleTest)).toBeInTheDocument();
        expect(getByText(childTest)).toBeInTheDocument();
    });
    it("renders no text if not given anything", () => {
        const { queryByText } = render(<TitledPaper />);
        expect(queryByText(titleTest)).not.toBeInTheDocument();
        expect(queryByText(childTest)).not.toBeInTheDocument();
    });
});
