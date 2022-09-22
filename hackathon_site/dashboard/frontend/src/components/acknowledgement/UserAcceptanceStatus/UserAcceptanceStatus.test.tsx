import React from "react";
import { render, fireEvent } from "testing/utils";
import { UserAcceptanceMessage } from "./UserAcceptanceStatus";
import { hackathonName } from "constants.js";

const handleGetStarted = jest.fn();

describe("<UserAcceptanceStatus/>", () => {
    it("Shows correct message for Acceptance status and calls handleGetStarted function", () => {
        const { getByText } = render(
            <UserAcceptanceMessage
                status="Accepted"
                handleGetStarted={handleGetStarted}
            />
        );

        expect(
            getByText(`Congratulations! You've been accepted to ${hackathonName}`)
        ).toBeInTheDocument();
        expect(
            getByText("Ready to prepare for the hackathon and order some hardware?")
        );

        const getStartedButton = getByText(/get started/i).closest("button");
        expect(getStartedButton).toBeInTheDocument();
        if (getStartedButton) fireEvent.click(getStartedButton);
        expect(handleGetStarted).toHaveBeenCalled();
    });

    it("Shows correct message for Waitlisted status", () => {
        const { getByText, queryByText } = render(
            <UserAcceptanceMessage
                status="Waitlisted"
                handleGetStarted={handleGetStarted}
            />
        );

        expect(
            getByText(
                `Thank you for applying to ${hackathonName} but you have been waitlisted and cannot use the Hardware Signout Site for now.`
            )
        ).toBeInTheDocument();

        const getStartedButton = queryByText(/get started/i);
        expect(getStartedButton).not.toBeInTheDocument();

        const dashboardLink = getByText(/dashboard/i);
        fireEvent.click(dashboardLink);
    });

    it("Shows correct message for Rejected status", () => {
        const { getByText, queryByText } = render(
            <UserAcceptanceMessage
                status="Rejected"
                handleGetStarted={handleGetStarted}
            />
        );

        expect(
            getByText(
                `Thank you for applying to ${hackathonName} but you have not been invited to participate this year.`
            )
        ).toBeInTheDocument();

        const getStartedButton = queryByText(/get started/i);
        expect(getStartedButton).not.toBeInTheDocument();

        const dashboardLink = getByText(/dashboard/i);
        fireEvent.click(dashboardLink);
    });

    it("Shows correct message for Incomplete status", () => {
        const { getByText, queryByText } = render(
            <UserAcceptanceMessage
                status="Incomplete"
                handleGetStarted={handleGetStarted}
            />
        );

        expect(
            getByText(
                `Thank you for signing up for ${hackathonName} but you don't seem to have finished your application or your application hasn't been reviewed yet.`
            )
        ).toBeInTheDocument();
        expect(getByText(/please finish your application/i)).toBeInTheDocument();
        const getStartedButton = queryByText(/get started/i);
        expect(getStartedButton).not.toBeInTheDocument();
    });
});
