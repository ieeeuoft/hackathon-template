import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

describe("Footer", () => {
    test("renders", () => {
        const fakeYear = 2020;
        global.Date.prototype.getFullYear = jest.fn(() => fakeYear);

        const { asFragment } = render(<Footer />);
        expect(asFragment()).toMatchSnapshot();
    });

    test("date", () => {
        const fakeYear = 2021;
        global.Date.prototype.getFullYear = jest.fn(() => fakeYear);

        const { getByText } = render(<Footer />);
        const footerText = getByText(/Built/, { exact: false });

        expect(footerText).toHaveTextContent(
            `© 2020 - ${fakeYear} Built by the web team at MakeUofT (University of Toronto)`
        );
    });
});
