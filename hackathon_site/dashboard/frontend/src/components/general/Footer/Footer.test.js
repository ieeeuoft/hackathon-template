import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

// will delete later, for demonstration now
jest.mock("@material-ui/core/Typography");

describe("Footer", () => {
    test("renders", () => {
        const { asFragment } = render(<Footer />);

        expect(asFragment()).toMatchSnapshot();
    });

    test("contains correct date", () => {
        const fakeDate = new Date("2020-05-01");

        const fakeDateClass = class extends Date {
            constructor() {
                super(fakeDate);
            }

            static now() {
                return fakeDate;
            }
        };

        global.Date = fakeDateClass;

        const { getByText } = render(<Footer />);

        const copyrightNode = getByText(/2020/, { exact: false });
        //expect(copyrightNode).toHaveTextContent("big sad");
    });
});
