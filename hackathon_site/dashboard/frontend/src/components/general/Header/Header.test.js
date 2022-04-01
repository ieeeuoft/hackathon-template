import React from "react";

import { render } from "testing/utils";

import Header from "./Header";
import { makeStore } from "slices/store";
import { initialState, userReducerName } from "slices/users/userSlice";
import { mockUser } from "testing/mockData";

describe("<Header />", () => {
    test("renders header with navbar", () => {
        const store = makeStore({
            [userReducerName]: {
                ...initialState,
                userData: {
                    ...initialState.userData,
                    user: mockUser,
                },
            },
        });
        const { getByText, getByTestId } = render(<Header />, { store });
        expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
        expect(getByTestId("headerLogo")).toBeInTheDocument();
        expect(getByText("Dashboard")).toBeInTheDocument(); // Checking if navbar is in header
    });

    test("renders header with no navbar", () => {
        const { getByText, getByTestId, queryByText } = render(
            <Header showNavbar={false} />
        );
        expect(getByText(/Hackathon Name/i)).toBeInTheDocument();
        expect(getByTestId("headerLogo")).toBeInTheDocument();
        expect(queryByText("Dashboard")).not.toBeInTheDocument(); // Checking if navbar is not in header
    });
});
