import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";

import { LoginForm, EnhancedLoginForm, ERROR_MESSAGES, TEST_IDS } from "./LoginForm";

describe("<LoginForm />", () => {
    it("Has the expected fields", () => {
        const { getByLabelText, queryByTestId } = render(
            <LoginForm
                errors={{}}
                handleChange={() => {}}
                handleSubmit={() => {}}
                handleReset={() => {}}
                isLoading={false}
                values={{ email: "", password: "" }}
            />
        );
        expect(getByLabelText("Email")).toBeInTheDocument();
        expect(getByLabelText("Password")).toBeInTheDocument();
        expect(queryByTestId("circular-progress")).toBeNull();
    });
});

describe("<EnhancedLoginForm />", () => {
    it("Calls handleLogin with correct values on success", async () => {
        const handleLoginSpy = jest.fn();
        const email = "foo@bar.com";
        const password = "abc123";

        const { findByLabelText, findByText } = render(
            <EnhancedLoginForm handleLogin={handleLoginSpy} />
        );

        const emailInput = await findByLabelText("Email");
        const passwordInput = await findByLabelText("Password");
        const button = await findByText("Log In");

        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(passwordInput, { target: { value: password } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleLoginSpy).toHaveBeenCalledWith({ email, password });
        });
    });

    it("Displays errors for missing fields", async () => {
        const handleLoginSpy = jest.fn();
        const { getByText, findByText } = render(
            <EnhancedLoginForm handleLogin={handleLoginSpy} />
        );

        const button = await findByText("Log In");

        fireEvent.click(button);

        await waitFor(() => {
            expect(handleLoginSpy).not.toHaveBeenCalled();
            expect(getByText(ERROR_MESSAGES.emailMissing)).toBeTruthy();
            expect(getByText(ERROR_MESSAGES.passwordMissing)).toBeTruthy();
        });
    });

    it("Displays an error for invalid email addresses", async () => {
        const handleLoginSpy = jest.fn();
        const { getByText, findByLabelText, findByText } = render(
            <EnhancedLoginForm handleLogin={handleLoginSpy} />
        );

        const emailInput = await findByLabelText("Email");
        const button = await findByText("Log In");

        fireEvent.change(emailInput, { target: { value: "foo" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleLoginSpy).not.toHaveBeenCalled();
            expect(getByText(ERROR_MESSAGES.emailInvalid)).toBeTruthy();
        });
    });

    it("Renders a loading spinner and disables the log in button when submitting", async () => {
        const { getByText, getByTestId } = render(
            <EnhancedLoginForm handleLogin={() => {}} isLoading={true} />
        );

        const button = getByText("Log In");

        expect(button.closest("button")).toBeDisabled();
        expect(getByTestId(TEST_IDS.circularProgress)).toBeTruthy();
    });

    it("Displays an alert when the rest failed for non-credentials reasons", () => {
        const requestFailure = {
            status: 500,
            message: "Something went horribly wrong",
        };
        const { getByTestId } = render(
            <EnhancedLoginForm
                handleLogin={() => {}}
                isLoading={false}
                requestFailure={requestFailure}
            />
        );

        expect(getByTestId(TEST_IDS.alert).innerHTML).toContain(requestFailure.message);
    });

    it("Displays field error states for invalid credentials", () => {
        const requestFailure = {
            status: 400,
            message: "Invalid credentials",
        };
        const { queryByTestId } = render(
            <EnhancedLoginForm
                handleLogin={() => {}}
                isLoading={false}
                requestFailure={requestFailure}
            />
        );

        expect(queryByTestId(TEST_IDS.alert)).toBeNull();
        expect(queryByTestId(TEST_IDS.emailHelperText).innerHTML).toBe(
            ERROR_MESSAGES.credentialsInvalid
        );
        expect(queryByTestId(TEST_IDS.passwordHelperText).innerHTML).toBe(
            ERROR_MESSAGES.credentialsInvalid
        );
    });
});
