import React from "react";
import { render } from "@testing-library/react";
import Header from "./Header";
import { withStoreAndRouter } from "testing/helpers";

describe("<Header />", () => {
    test("renders header with navbar", () => {
        const { getByText, getByTestId } = render(withStoreAndRouter(<Header />));
        expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
        expect(getByTestId("headerLogo")).toBeInTheDocument();
        expect(getByText("Dashboard")).toBeInTheDocument(); // Checking if navbar is in header
    });

    test("renders header with no navbar", () => {
        const { getByText, getByTestId, queryByText } = render(
            withStoreAndRouter(<Header showNavbar={false} />)
        );
        expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
        expect(getByTestId("headerLogo")).toBeInTheDocument();
        expect(queryByText("Dashboard")).not.toBeInTheDocument(); // Checking if navbar is not in header
    });
});
