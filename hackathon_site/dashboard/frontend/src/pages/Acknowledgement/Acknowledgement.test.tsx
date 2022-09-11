import React from "react";
import Acknowledgement from "./Acknowledgement";
import { render } from "testing/utils";

describe("<Acknowledgement />", () => {
    it("Shows loading bar and user acceptance message on load", () => {
        const { getByText } = render(<Acknowledgement />);
    });

    it("Shows error message if User Acceptance API fails", () => {
        const { getByText } = render(<Acknowledgement />);
    });

    it("Shows message if user has already been granted access", () => {
        const { getByText } = render(<Acknowledgement />);
    });

    it("Shows acknowledgement form after user clicks next", () => {
        const { getByText } = render(<Acknowledgement />);
    });

    it("Shows acknowledgement form after user clicks next", () => {
        const { getByText } = render(<Acknowledgement />);
    });

    it("Shows loading and success message if profile is created", () => {
        const { getByText } = render(<Acknowledgement />);
    });

    it("Shows error message if profile creation fails", () => {
        const { getByText } = render(<Acknowledgement />);
    });
});
