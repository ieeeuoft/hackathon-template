import React from "react";
import { render } from "@testing-library/react";
import Footer from "../components/general/Footer/Footer";

jest.mock("@material-ui/core/Typography");

describe("Footer", () => {
    test("renders", () => {
        const { asFragment } = render(<Footer />);

        expect(asFragment()).toMatchSnapshot();
    });
});
