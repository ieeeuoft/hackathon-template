import React from "react";
import { render } from "@testing-library/react";
import IncidentForm from "./IncidentForm";
import { withRouter } from "testing/helpers";

test("renders without crashing", () => {
    const { getByText } = render(withRouter(<IncidentForm />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
