import React from "react";

import { render } from "testing/utils";

import LoginPage from "./Login";

describe("<LoginPage />", () => {
    it("Renders with title and cookie text", () => {
        const { getByText } = render(<LoginPage />);

        expect(getByText(/login/i)).toBeInTheDocument();
        expect(getByText(/we use cookies/i)).toBeInTheDocument();
    });
});
