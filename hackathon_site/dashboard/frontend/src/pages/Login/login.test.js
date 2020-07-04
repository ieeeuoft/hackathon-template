import React from "react";
import { render } from "@testing-library/react";
import LoginPage from "./Login";
import { withStoreAndRouter } from "testing/helpers";

describe("<LoginPage />", () => {
    it("Renders with title and cookie text", () => {
        const { getByText } = render(withStoreAndRouter(<LoginPage />));

        expect(getByText(/login/i)).toBeInTheDocument();
        expect(getByText(/we use cookies/i)).toBeInTheDocument();
    });
});
