import React from "react";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { push } from "connected-react-router";

import { render } from "testing/utils";
import { mockAdminUser, mockUser } from "testing/mockData";

import { userReducerName, fetchUserData } from "slices/users/userSlice";
import { displaySnackbar } from "slices/ui/uiSlice";
import withUserCheck from "components/HOCs/withUserCheck/withUserCheck";

jest.mock("api/api"); // To make sure that fetchUserData() doesn't actually do anything

const mockStore = configureStore([thunk]);

describe("withAuthenticationCheck", () => {
    const content = "Hello there";
    const ComponentToWrap = ({ children }) => <div>{children}</div>;

    it("calls fetchUserData() if the user is missing and displays a loading bar", () => {
        const WrappedComponent = withUserCheck("both", ComponentToWrap);
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: null,
                },
            },
        };

        const store = mockStore(mockState);

        const { queryByText, getByTestId } = render(
            <WrappedComponent>{content}</WrappedComponent>,
            { store }
        );

        expect(getByTestId("linear-progress")).toBeInTheDocument();
        expect(queryByText(content)).not.toBeInTheDocument();
        expect(store.getActions()).toEqual([
            expect.objectContaining({
                type: fetchUserData.pending.type,
            }),
        ]);
    });

    it("Displays a snackbar and pushes to the 404 page if participant user has no admin access", () => {
        const WrappedComponent = withUserCheck("admin", ComponentToWrap);
        // Used by displaySnackbar
        jest.spyOn(global.Math, "random").mockReturnValue(0.45526621894095487);

        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockUser,
                },
            },
        };

        const store = mockStore(mockState);

        render(<WrappedComponent>{content}</WrappedComponent>, {
            store,
        });

        expect(store.getActions()).toEqual([
            displaySnackbar({
                message: "You do not have permission to access this page",
                options: { variant: "error" },
            }),
            push("/404"),
        ]);

        global.Math.random.mockRestore();
    });

    it("Redirects user to acknowledgement page if user type is none", () => {
        const WrappedComponent = withUserCheck("both", ComponentToWrap);
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

        const { queryByText } = render(<WrappedComponent>{content}</WrappedComponent>, {
            store,
        });

        expect(queryByText(content)).not.toBeInTheDocument();
        expect(store.getActions()).toEqual([push("/acknowledgement")]);

        global.Math.random.mockRestore();
    });

    it("Allows none-type or participant users to access onboarding pages", () => {
        const WrappedComponent = withUserCheck("onboard", ComponentToWrap);
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockUser,
                },
            },
        };

        const store = mockStore(mockState);

        const { getByText } = render(<WrappedComponent>{content}</WrappedComponent>, {
            store,
        });

        expect(getByText(content)).toBeInTheDocument();
    });

    it("Prevents admins from accessing onboarding pages", () => {
        const WrappedComponent = withUserCheck("onboard", ComponentToWrap);
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockAdminUser,
                },
            },
        };

        jest.spyOn(global.Math, "random").mockReturnValue(0.45526621894095487);

        const store = mockStore(mockState);

        render(<WrappedComponent>{content}</WrappedComponent>, {
            store,
        });

        expect(store.getActions()).toEqual([
            displaySnackbar({
                message: "You do not have permission to access this page",
                options: { variant: "error" },
            }),
            push("/404"),
        ]);

        global.Math.random.mockRestore();
    });

    it("Allow user to access page with admin permissions", () => {
        const WrappedComponent = withUserCheck("admin", ComponentToWrap);
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockAdminUser,
                },
            },
        };

        const store = mockStore(mockState);

        const { getByText } = render(<WrappedComponent>{content}</WrappedComponent>, {
            store,
        });

        expect(getByText(content)).toBeInTheDocument();
    });

    it("Display SecondaryComponent when user has admin access", () => {
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockAdminUser,
                },
            },
        };

        const store = mockStore(mockState);

        const SecondaryComponent = () => <div>Secondary</div>;
        const DoubleComponents = withUserCheck(
            "admin",
            ComponentToWrap,
            SecondaryComponent
        );
        const { getByText } = render(<DoubleComponents>{content}</DoubleComponents>, {
            store,
        });

        expect(getByText("Secondary")).toBeInTheDocument();
    });

    it("Do not display SecondaryComponent when user only has profile", () => {
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockUser,
                },
            },
        };

        const store = mockStore(mockState);

        const SecondaryComponent = () => <div>Secondary</div>;
        const DoubleComponents = withUserCheck(
            "participant",
            ComponentToWrap,
            SecondaryComponent
        );
        const { queryByText, getByText } = render(
            <DoubleComponents>{content}</DoubleComponents>,
            {
                store,
            }
        );

        expect(queryByText("Secondary")).not.toBeInTheDocument();
        expect(getByText(content)).toBeInTheDocument();
    });

    it("Renders the component with passed through props when the profile is set", () => {
        const WrappedComponent = withUserCheck("both", ComponentToWrap);
        const mockState = {
            [userReducerName]: {
                userData: {
                    user: mockUser,
                },
            },
        };

        const store = mockStore(mockState);

        const { getByText } = render(<WrappedComponent>{content}</WrappedComponent>, {
            store,
        });

        expect(getByText(content)).toBeInTheDocument();
        expect(store.getActions().length).toBe(0);
    });
});
