import React from "react";
import { render } from "@testing-library/react";
import LoginPage from "./Login";
import { withRouter } from "testing";

describe("<LoginPage />", () => {
    it("Renders with title and cookie text", () => {
        const { getByText } = render(withRouter(<LoginPage />));

        expect(getByText(/login/i)).toBeInTheDocument();
        expect(getByText(/we use cookies/i)).toBeInTheDocument();
    });
});
