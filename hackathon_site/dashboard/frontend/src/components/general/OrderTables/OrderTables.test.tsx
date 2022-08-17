import { render } from "testing/utils";
import React from "react";
import { ChipStatus } from "components/general/OrderTables/OrderTables";

describe("<ChipStatus />", () => {
    test("Ready status", () => {
        const { getByText } = render(<ChipStatus status="Ready for Pickup" />);
        expect(getByText("Ready for pickup")).toBeInTheDocument();
    });

    test("Pending status", () => {
        const { getByText } = render(<ChipStatus status="Submitted" />);
        expect(getByText("In progress")).toBeInTheDocument();
    });

    test("Error status", () => {
        const { getByText } = render(<ChipStatus status="Error" />);
        expect(getByText("Visit the tech station")).toBeInTheDocument();
    });
});
