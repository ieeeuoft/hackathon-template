import React from "react";
import { fireEvent, render, screen, waitFor } from "testing/utils";
import IncidentForm from "./IncidentForm";
import { INCIDENT_ERROR_MSG } from "./IncidentForm";

describe("<Incident Form />", () => {
    test("Renders without crashing", () => {
        render(<IncidentForm />);
        expect(screen.getByText("Item Incident Form")).toBeInTheDocument();
    });
});
