import React from "react";
import AlertBox from "components/general/AlertBox/AlertBox";
import { render } from "testing/utils";

const mockErrorList = [
    "This particular reason",
    "Another horrible excuse",
    "As well as this unfortunate reason",
];
const mockSingleError = "Error is here for this single reason.";
const mockErrorTitle = "An error has occurred due to the following reasons:";

describe("Error Box displays correctly with the right information", () => {
    it("Shows title and a list if error prop is an array", async () => {
        const { getByText, getByTestId } = render(
            <AlertBox error={mockErrorList} title={mockErrorTitle} />
        );

        getByTestId("alert-error-list");
        getByText(new RegExp(mockErrorTitle, "i"));
        mockErrorList.forEach((error) => getByText(new RegExp(error, "i")));
    });

    it("Shows only error text", async () => {
        const { getByText, queryByText, queryByTestId } = render(
            <AlertBox error={mockSingleError} title={mockErrorTitle} />
        );

        expect(queryByTestId("alert-error-list")).not.toBeInTheDocument();
        expect(queryByText(new RegExp(mockErrorTitle, "i"))).not.toBeInTheDocument();
        getByText(new RegExp(mockSingleError, "i"));
    });

    it("Shows default title if no title given", async () => {
        const { getByText } = render(<AlertBox error={mockErrorList} />);

        getByText(/An error has occurred because:/i);
    });
});
