import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

describe("Footer", () => {
    test("renders", () => {
        const { asFragment } = render(<Footer />);
        expect(asFragment()).toMatchSnapshot();
    });

    test("date", () => {
        const fakeDate = new Date("2021-05-17");
        const fakeYear = "2021";

        const fakeDateClass = class extends Date {
            constructor() {
                super(fakeDate);
            }

            static now() {
                return null;
            }

            getFakeYear() {
                return fakeYear;
            }
        };

        global.Date = fakeDateClass;
        const { getByText } = render(<Footer />);
        const footerText = getByText(/built/, { exact: false });

        expect(footerText).toHaveTextContent(
            `© 2020 - ${fakeYear} built by the web team at MakeUofT (University of Toronto)`
        );
    });
});
