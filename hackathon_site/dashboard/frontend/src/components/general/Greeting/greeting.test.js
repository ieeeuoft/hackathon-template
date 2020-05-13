import React from "react";
import { render, act } from "@testing-library/react";

import { UnconnectedGreeting, TEST_IDS } from "./Greeting";

describe("<UnconnectedGreeting />", () => {
    const defaultProps = {
        fetchUserData: () => {},
        isLoading: false,
        data: {
            name: "Foo Bar",
        },
        errors: null,
    };

    it("Calls fetchUserData on mount", async () => {
        const userID = 1;
        const fetchUserDataMock = jest.fn();

        render(
            <UnconnectedGreeting fetchUserData={fetchUserDataMock} userID={userID} />
        );
        expect(fetchUserDataMock).toHaveBeenCalledWith(userID);
    });

    it("Renders a loading wheel when loading", () => {
        const { getByTestId } = render(
            <UnconnectedGreeting {...defaultProps} isLoading={true} />
        );
        expect(getByTestId("loading-wheel")).toBeTruthy();
    });

    it("Says so when there are errors", () => {
        const { getByText } = render(
            <UnconnectedGreeting {...defaultProps} errors={{ sad: true }} />
        );
        expect(getByText("Something went wrong.")).toBeTruthy();
    });

    it("Shows name when data is provided", () => {
        const { getByTestId, debug } = render(
            <UnconnectedGreeting {...defaultProps} />
        );
        expect(getByTestId(TEST_IDS.name).innerHTML).toEqual(
            `Hello, ${defaultProps.data.name}.`
        );
    });
});
