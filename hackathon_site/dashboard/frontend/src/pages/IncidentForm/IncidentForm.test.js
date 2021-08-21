import React from "react";
import { render } from "@testing-library/react";
import IncidentForm from "./IncidentForm";
import { withStoreAndRouter } from "testing/utils";

test("renders without crashing", () => {
    const { getByText } = render(withStoreAndRouter(<IncidentForm />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
