import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { EnhancedAcknowledgmentForm } from "./AcknowledgementForm";

const waiver = "Waiver of Liability and Hold Harmless Agreement";

describe("<EnhancedAcknowledgmentForm />", () => {
    test("Check if all the text are present", () => {
        const handleSubmit = () => {};
        const requestFailure = () => {};
        const openDoc = () => {};

        const { getByText } = render(
            <EnhancedAcknowledgmentForm
                handleSubmit={handleSubmit}
                requestFailure={requestFailure}
                openDoc={openDoc}
            />
        );

        expect(getByText(/Continue/i)).toBeInTheDocument();
        expect(getByText(/e-signature/i)).toBeInTheDocument();
        expect(
            getByText(
                /I understand that making a request does not guarantee hardware. Hardware is given on a first-come-first-serve basis./i
            )
        ).toBeInTheDocument();
        expect(
            getByText(
                /Each member of the team must provide government-issued photo ID to check out components. ID will be returned when all components are returned./i
            )
        ).toBeInTheDocument();
        expect(
            getByText(/I cannot keep hardware\/components lent out to me/i)
        ).toBeInTheDocument();
        expect(
            getByText(
                /I will be held accountable for damaged or lost hardware. The handling of each instance is case by case./i
            )
        ).toBeInTheDocument();
        expect(
            getByText(
                /IN SIGNING THIS RELEASE, I ACKNOWLEDGE AND REPRESENT THAT I have read the foregoing/i
            )
        ).toBeInTheDocument();
        expect(getByText(waiver)).toBeInTheDocument();
        expect(
            getByText(
                /, understand it and sign it voluntarily as my own free act and deed; no oral representations, statements, or inducements, apart from the foregoing written agreement, have been made; I am at least eighteen \(18\) years of age and fully competent; and I execute this Release for full, adequate and complete consideration fully intending to be bound by same./i
            )
        ).toBeInTheDocument();
    });

    test("Check if the submit button is called when pressed, and if the openDoc function gets called for the link", () => {
        const handleSubmit = jest.fn();
        const requestFailure = () => {};
        const openDoc = jest.fn();

        const { getByText } = render(
            <EnhancedAcknowledgmentForm
                handleSubmit={handleSubmit}
                requestFailure={requestFailure}
                openDoc={openDoc}
            />
        );

        const submitButton = getByText(/Continue/i);
        fireEvent.click(submitButton);
        expect(handleSubmit).toHaveBeenCalled();
        const waiverLink = getByText(waiver);
        fireEvent.click(waiverLink);
        expect(openDoc).toHaveBeenCalled();
    });
});
