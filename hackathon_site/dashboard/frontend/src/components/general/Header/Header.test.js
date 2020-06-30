import React from "react";
import { render } from "@testing-library/react";
import Header from "./Header";
import { withRouter, withStore } from "testing/helpers";

describe("<Header />", () => {
    test("renders header with navbar", () => {
        const { getByText, getByTestId } = render(withStore(withRouter(<Header />)));
        expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
        expect(getByTestId("headerLogo")).toBeInTheDocument();
        expect(getByText("Dashboard")).toBeInTheDocument(); // Checking if navbar is in header
    });

    test("renders header with no navbar", () => {
        const { getByText, getByTestId, queryByText } = render(
            withStore(withRouter(<Header showNavbar={false} />))
        );
        expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
        expect(getByTestId("headerLogo")).toBeInTheDocument();
        expect(queryByText("Dashboard")).not.toBeInTheDocument(); // Checking if navbar is not in header
    });
});
