import React from "react";

import { render } from "testing/utils";

import IncidentForm from "./IncidentForm";

test("renders without crashing", () => {
    const { getByText } = render(<IncidentForm />);
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
