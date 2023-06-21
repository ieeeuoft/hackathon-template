import React from "react";
import { fireEvent, render, waitFor } from "testing/utils";
import IncidentForm from "./IncidentForm";
import { INCIDENT_ERROR_MSG } from "./IncidentForm";

describe("Incident Form", () => {
    test("Renders without crashing", () => {
        const { getByText } = render(<IncidentForm />);
        expect(getByText("Item Incident Form")).toBeInTheDocument();
    });
});
