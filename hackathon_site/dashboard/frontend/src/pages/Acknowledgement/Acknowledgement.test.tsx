import React from "react";
import Acknowledgement from "./Acknowledgement";
import {
    makeMockApiResponse,
    promiseResolveWithDelay,
    render,
    when,
    waitFor,
} from "testing/utils";
import {
    mockProfile,
    mockUser,
    mockUserWithoutProfile,
    mockUserWithReviewStatus,
} from "testing/mockData";
import { AxiosResponse } from "axios";
import { Profile, UserWithReviewStatus } from "api/types";
import { get, post } from "api/api";
import rootStore, { makeStore, RootState } from "slices/store";
import { initialState, userReducerName } from "slices/users/userSlice";
import { fireEvent, queryByTestId } from "@testing-library/react";
import { acknowledgementCheckboxes } from "components/acknowledgement/AcknowledgementForm/AcknowledgementForm";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    post: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPost = post as jest.MockedFunction<typeof post>;

const createProfileAPI = "/api/event/profiles/profile/";
const userAcceptanceAPI = "/api/event/users/user/review_status/";
const userAcceptanceAPIResponse: AxiosResponse<UserWithReviewStatus> =
    makeMockApiResponse(mockUserWithReviewStatus);
const createProfileAPIResponse: AxiosResponse<Profile> =
    makeMockApiResponse(mockProfile);

describe("<Acknowledgement />", () => {
    it("Shows loading bar and user acceptance message on load", async () => {
        when(mockedGet)
            .calledWith(userAcceptanceAPI)
            .mockReturnValue(promiseResolveWithDelay(userAcceptanceAPIResponse, 500));

        const { getByText, getByTestId } = render(<Acknowledgement />);

        expect(getByTestId("userReviewStatusLoadingBar")).toBeInTheDocument();

        await waitFor(() => {
            expect(getByTestId("userReviewStatusMessage")).toBeInTheDocument();
            expect(getByText(/get started/i)).toBeInTheDocument();
        });
    });

    it("Shows error message if User Acceptance API fails", async () => {
        const error = {
            response: { status: 999, data: "Something went wrong" },
        };

        when(mockedGet).calledWith(userAcceptanceAPI).mockRejectedValueOnce(error);

        const { getByText, queryByTestId } = render(<Acknowledgement />);

        await waitFor(() => {
            expect(getByText("Something went wrong")).toBeInTheDocument();
            expect(getByText("An error has occurred")).toBeInTheDocument();
            expect(queryByTestId("userReviewStatusMessage")).not.toBeInTheDocument();
        });
    });

    it("Shows message if user has already been granted access", async () => {
        when(mockedGet)
            .calledWith(userAcceptanceAPI)
            .mockResolvedValue(userAcceptanceAPIResponse);

        const mockState: RootState = {
            ...rootStore.getState(),
            [userReducerName]: {
                ...initialState,
                userData: {
                    ...initialState.userData,
                    user: mockUser,
                },
            },
        };
        const store = makeStore(mockState);

        const { getByText, queryByTestId } = render(<Acknowledgement />, { store });

        await waitFor(() => {
            expect(
                getByText(
                    /You have already been granted permissions to access the Hardware Signout Site./i
                )
            ).toBeInTheDocument();
            expect(queryByTestId("userReviewStatusMessage")).not.toBeInTheDocument();
            fireEvent.click(getByText("here"));
        });
    });

    it("Shows acknowledgement form after user clicks next", async () => {
        when(mockedGet)
            .calledWith(userAcceptanceAPI)
            .mockResolvedValue(userAcceptanceAPIResponse);

        const { getByText, getByTestId, queryByTestId } = render(<Acknowledgement />);

        await waitFor(() => {
            expect(getByTestId("userReviewStatusMessage")).toBeInTheDocument();
            expect(getByText(/get started/i)).toBeInTheDocument();
        });

        fireEvent.click(getByText(/get started/i));

        await waitFor(() => {
            expect(getByText("ACKNOWLEDGEMENTS")).toBeInTheDocument();
            expect(queryByTestId("userReviewStatusMessage")).not.toBeInTheDocument();
        });
    });

    it("Shows loading and success message if profile is created", async () => {
        const createProfileRequest = {
            e_signature: "Lisa Li",
            acknowledge_rules: true,
        };

        when(mockedGet)
            .calledWith(userAcceptanceAPI)
            .mockResolvedValue(userAcceptanceAPIResponse);

        when(mockedPost)
            .calledWith(createProfileAPI, createProfileRequest)
            .mockResolvedValue(createProfileAPIResponse);

        const mockState: RootState = {
            ...rootStore.getState(),
            [userReducerName]: {
                ...initialState,
                userData: {
                    ...initialState.userData,
                    user: {
                        ...mockUserWithoutProfile,
                        profile: null,
                        groups: [],
                    },
                },
            },
        };

        const store = makeStore(mockState);

        const { getByText, findByTestId, queryByTestId, findByLabelText } = render(
            <Acknowledgement />,
            { store }
        );

        await findByTestId("userReviewStatusMessage");
        fireEvent.click(getByText(/get started/i));

        await waitFor(() => {
            expect(getByText("ACKNOWLEDGEMENTS")).toBeInTheDocument();
            expect(queryByTestId("userReviewStatusMessage")).not.toBeInTheDocument();
        });

        for (let c of acknowledgementCheckboxes) {
            const checkbox = await findByLabelText(c.label);
            fireEvent.click(checkbox);
        }
        const eSignature = await findByLabelText("e-signature");
        fireEvent.change(eSignature, { target: { value: "Lisa Li" } });

        const submitButton = await getByText("Continue");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockedPost).toHaveBeenCalledWith(
                createProfileAPI,
                createProfileRequest
            );
            expect(
                getByText(
                    `${mockUserWithoutProfile.first_name}, you're ready to get started. We've placed you in Team ${createProfileAPIResponse.data.team} but you can leave and join another team anytime.`
                )
            ).toBeInTheDocument();
            fireEvent.click(getByText("Let's Go!"));
        });
    });

    it("Shows error message if profile creation fails", async () => {
        const createProfileRequest = {
            e_signature: "Lisa Li",
            acknowledge_rules: true,
        };

        const error = {
            response: { status: 999, data: "Something went wrong" },
        };

        when(mockedGet)
            .calledWith(userAcceptanceAPI)
            .mockResolvedValue(userAcceptanceAPIResponse);

        when(mockedPost)
            .calledWith(createProfileAPI, createProfileRequest)
            .mockRejectedValueOnce(error);

        const { getByText, findByText, findByLabelText } = render(<Acknowledgement />);

        const getStartedButton = await findByText(/get started/i);
        fireEvent.click(getStartedButton);
        await findByText("ACKNOWLEDGEMENTS");

        for (let c of acknowledgementCheckboxes) {
            const checkbox = await findByLabelText(c.label);
            fireEvent.click(checkbox);
        }
        const eSignature = await findByLabelText("e-signature");
        fireEvent.change(eSignature, { target: { value: "Lisa Li" } });

        const submitButton = await getByText("Continue");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockedPost).toHaveBeenCalledWith(
                createProfileAPI,
                createProfileRequest
            );
            expect(
                getByText(/an error has occurred while granting you permissions/i)
            ).toBeInTheDocument();
            expect(getByText(error.response.data)).toBeInTheDocument();
        });
    });
});
