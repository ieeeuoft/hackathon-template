import React from "react";
import { fireEvent, render, screen, waitFor } from "testing/utils";
import IncidentForm from "./IncidentForm";
import { INCIDENT_ERROR_MSG } from "./IncidentForm";

describe("<Incident Form />", () => {
    test("Renders without crashing", () => {
        render(<IncidentForm />);
        expect(screen.getByText("Item Incident Form")).toBeInTheDocument();
    });

    test("Renders all form components", () => {
        render(<IncidentForm />);

        const radios = screen.getAllByRole("radio");
        const dropdown = screen.getByTestId("qty-dropdown");
        const textareas = screen.getAllByRole("textbox");

        expect(radios).toHaveLength(3); // three radio buttons
        expect(dropdown).toBeInTheDocument(); // one dropdown
        expect(textareas).toHaveLength(3); // three text inputs
    });

    test("Renders submit button", () => {
        render(<IncidentForm />);

        const submitButton = screen.getByRole("button", { name: "Submit" });
        expect(submitButton).toBeInTheDocument();
    });
});
