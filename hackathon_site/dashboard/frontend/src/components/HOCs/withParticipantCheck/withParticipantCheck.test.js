import React from "react";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { push } from "connected-react-router";

import { userReducerName, fetchUserData } from "slices/users/userSlice";
import { displaySnackbar } from "slices/ui/uiSlice";
import { withStore } from "testing/helpers";
import { mockUser } from "testing/mockData";
import withParticipantCheck from "./withParticipantCheck";

jest.mock("api/api"); // To make sure that fetchUserData() doesn't actually do anything

const mockStore = configureStore([thunk]);

describe("withAuthenticationCheck", () => {
    const content = "Hello there";
    const ComponentToWrap = ({ children }) => <div>{children}</div>;
    const WrappedComponent = withParticipantCheck(ComponentToWrap);

    it("calls fetchUserData() if the user is missing and displays a loading bar", () => {
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: null,
                },
            },
        };

        const store = mockStore(mockState);

        const { queryByText, getByTestId } = render(
            withStore(<WrappedComponent>{content}</WrappedComponent>, store)
        );

        expect(getByTestId("linear-progress")).toBeInTheDocument();
        expect(queryByText(content)).not.toBeInTheDocument();
        expect(store.getActions()).toEqual([
            expect.objectContaining({
                type: fetchUserData.pending.type,
            }),
        ]);
    });

    it("Displays a snackbar and pushes to the 404 page if the user has no profile", () => {
        // Used by displaySnackbar
        jest.spyOn(global.Math, "random").mockReturnValue(0.45526621894095487);

        const mockState = {
            [userReducerName]: {
                userData: {
                    user: {
                        ...mockUser,
                        profile: null,
                    },
                },
            },
        };

        const store = mockStore(mockState);

        const { queryByText } = render(
            withStore(<WrappedComponent>{content}</WrappedComponent>, store)
        );

        expect(queryByText(content)).not.toBeInTheDocument();
        expect(store.getActions()).toEqual([
            displaySnackbar({
                message: "You do not have permission to access this page",
                options: { variant: "error" },
            }),
            push("/404"),
        ]);

        global.Math.random.mockRestore();
    });

    it("Renders the component with passed through props when the profile is set", () => {
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockUser,
                },
            },
        };

        const store = mockStore(mockState);

        const { getByText } = render(
            withStore(<WrappedComponent>{content}</WrappedComponent>, store)
        );

        expect(getByText(content)).toBeInTheDocument();
        expect(store.getActions().length).toBe(0);
    });
});
