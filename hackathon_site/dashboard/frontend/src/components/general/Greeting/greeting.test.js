import React from "react";
import { render } from "@testing-library/react";

import { UnconnectedGreeting, TEST_IDS } from "./Greeting";

describe("<UnconnectedGreeting />", () => {
    const defaultProps = {
        fetchUserById: () => {},
        isLoading: false,
        data: {
            name: "Foo Bar",
        },
        error: null,
    };

    it("Calls fetchUserData on mount", async () => {
        const userID = 1;
        const fetchUserByIdMock = jest.fn();

        render(
            <UnconnectedGreeting fetchUserById={fetchUserByIdMock} userID={userID} />
        );
        expect(fetchUserByIdMock).toHaveBeenCalledWith(userID);
    });

    it("Renders a loading wheel when loading", () => {
        const { getByTestId } = render(
            <UnconnectedGreeting {...defaultProps} isLoading={true} />
        );
        expect(getByTestId("loading-wheel")).toBeTruthy();
    });

    it("Says so when there are errors", () => {
        const { getByText } = render(
            <UnconnectedGreeting {...defaultProps} error={{ message: "It broke" }} />
        );
        expect(getByText("Something went wrong", { exact: false })).toBeTruthy();
    });

    it("Shows name when data is provided", () => {
        const { getByTestId } = render(<UnconnectedGreeting {...defaultProps} />);
        expect(getByTestId(TEST_IDS.name).innerHTML).toEqual(
            `Hello, ${defaultProps.data.name}.`
        );
    });
});
