import React from "react";
import { render } from "@testing-library/react";
import { HashRouter as Router } from "react-router-dom";
import Header from "./Header";

test("renders header with navbar", () => {
    const { getByText, getByTestId } = render(
        <Router>
            <Header />
        </Router>
    );
    expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
    expect(getByTestId("headerLogo")).toBeInTheDocument();
    expect(getByText("Dashboard")).toBeInTheDocument(); // Checking if navbar is in header
});

test("renders header with no navbar", () => {
    const { getByText, getByTestId } = render(
        <Router>
            <Header showNavbar={false} />
        </Router>
    );
    expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
    expect(getByTestId("headerLogo")).toBeInTheDocument();
    expect(getByText("Dashboard")).not.toBeInTheDocument(); // Checking if navbar is not in header
});
