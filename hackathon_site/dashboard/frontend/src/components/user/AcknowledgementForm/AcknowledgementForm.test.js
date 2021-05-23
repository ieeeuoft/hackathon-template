import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import {
    EnhancedAcknowledgmentForm,
    acknowledgementCheckboxes,
} from "./AcknowledgementForm";

describe("<EnhancedAcknowledgmentForm />", () => {
    it("Check if all the text is present", () => {
        const { getByText, queryByText } = render(
            <EnhancedAcknowledgmentForm isLoading={false} />
        );

        expect(getByText("Continue")).toBeInTheDocument();
        expect(getByText("e-signature")).toBeInTheDocument();
        for (let c of acknowledgementCheckboxes) {
            expect(queryByText(c.label)).toBeTruthy();
        }
        expect(
            getByText("Waiver of Liability and Hold Harmless Agreement")
        ).toBeInTheDocument();
        expect(getByText(/IN SIGNING THIS RELEASE/i)).toBeInTheDocument();
        expect(getByText(/understand it and sign it voluntarily/i)).toBeInTheDocument();
    });

    it("Calls handleSubmit when the 'Continue' button is clicked", async () => {
        const handleSubmit = jest.fn();

        const { getByText, findByLabelText } = render(
            <EnhancedAcknowledgmentForm handleSubmit={handleSubmit} isLoading={false} />
        );

        for (let c of acknowledgementCheckboxes) {
            const checkbox = await findByLabelText(c.label);
            fireEvent.click(checkbox);
        }
        const eSignature = await findByLabelText("e-signature");
        fireEvent.change(eSignature, { target: { value: "Lisa Li" } });

        const submitButton = await getByText("Continue");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledWith({
                eSignature: "Lisa Li",
                acknowledgeRules: true,
            });
        });
    });

    it("Doesn't call handleSubmit when the button is disabled because the form isn't filled", async () => {
        const handleSubmit = jest.fn();

        const { getByText, findByLabelText } = render(
            <EnhancedAcknowledgmentForm handleSubmit={handleSubmit} isLoading={false} />
        );

        const submitButton = await getByText("Continue");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(handleSubmit).not.toHaveBeenCalledWith({
                eSignature: "Lisa Li",
                acknowledgeRules: true,
            });
        });
    });

    it("Displays a loading wheel on Continue button when loading", () => {
        const { getByTestId, getByText } = render(
            <EnhancedAcknowledgmentForm isLoading={true} />
        );

        const button = getByText("Continue");

        expect(getByTestId("circularProgress")).toBeInTheDocument();
        expect(button.closest("button")).toBeDisabled();
    });
});
