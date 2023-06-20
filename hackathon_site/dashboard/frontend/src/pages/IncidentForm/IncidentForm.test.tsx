import React from "react";
import { render } from "testing/utils";
import IncidentForm from "./IncidentForm";

describe("<IncidentForm />", () => {
    it("Renders without crashing", () => {
        const { getByText } = render(<IncidentForm />);
        expect(getByText("Item Incident Form")).toBeInTheDocument();
    });
});
