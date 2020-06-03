import React from "react";
import { render } from "@testing-library/react";
import { HashRouter as Router } from "react-router-dom";
import Header from "./Header";

test("renders hackathon name", () => {
    const { getByText, getByTestId } = render(
        <Router>
            <Header />
        </Router>
    );
    expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
    expect(getByTestId("headerLogo")).toBeInTheDocument();
});
