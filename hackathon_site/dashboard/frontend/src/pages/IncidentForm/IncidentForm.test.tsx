import React from "react";
import { render } from "testing/utils";
import IncidentForm from "./IncidentForm";

describe("<IncidentForm />", () => {
    it("Renders without crashing", () => {
        const { getByText } = render(<IncidentForm />);
        const title = getByText("Item Incident Form");
        expect(title).toBeInTheDocument();
    });
});
