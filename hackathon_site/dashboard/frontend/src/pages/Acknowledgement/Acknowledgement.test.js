import React from "react";
import { render } from "@testing-library/react";
import Acknowledgement from "./Acknowledgement";
import { withStoreAndRouter } from "testing/helpers";

describe("<Acknowledgement />", () => {
    it("Renders with title ", () => {
        const { getByText } = render(withStoreAndRouter(<Acknowledgement />));

        expect(getByText(/Acknowledgements/i)).toBeInTheDocument();
    });
});
