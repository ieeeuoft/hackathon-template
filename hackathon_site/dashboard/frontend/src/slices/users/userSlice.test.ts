import configureStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";
import { push } from "connected-react-router";

import { post, get } from "api/api";
import {
    mockAdminUser,
    mockProfile,
    mockProfileRequestBody,
    mockUser,
    mockUserWithReviewStatus,
} from "testing/mockData";
import { displaySnackbar } from "slices/ui/uiSlice";
import {
    userSliceSelector,
    userDataSelector,
    userSelector,
    loginSelector,
    logoutSelector,
    reducer,
    userReducerName,
    initialState,
    logIn,
    logout,
    fetchUserData,
    userTypeSelector,
    fetchUserAcceptanceStatus,
    createProfile,
    userAcceptanceSelector,
    createProfileSelector,
} from "slices/users/userSlice";
import rootStore, { RootState } from "slices/store";
import { AnyAction } from "redux";
import { makeMockApiResponse, when } from "testing/utils";
import { AxiosResponse } from "axios";
import { Profile, User, UserWithReviewStatus } from "api/types";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    post: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPost = post as jest.MockedFunction<typeof post>;

const mockState: RootState = {
    ...rootStore.getState(),
    [userReducerName]: initialState,
};

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

describe("Selectors", () => {
    test("userSliceSelector returns the user store", () => {
        expect(userSliceSelector(mockState)).toEqual(mockState[userReducerName]);
    });

    test("userDataSelector returns the userData object", () => {
        expect(userDataSelector(mockState)).toEqual(
            mockState[userReducerName].userData
        );
    });

    test("userSelector returns the current user", () => {
        expect(userSelector(mockState)).toEqual(
            mockState[userReducerName].userData.user
        );
    });

    test("userTypeSelector returns the correct user type", () => {
        expect(userTypeSelector(mockState)).toEqual("none");
    });

    test("userTypeSelector returns participant user type", () => {
        const mockParticipantState: RootState = {
            ...rootStore.getState(),
            [userReducerName]: {
                ...initialState,
                userData: {
                    ...initialState.userData,
                    user: mockUser,
                },
            },
        };
        expect(userTypeSelector(mockParticipantState)).toEqual("participant");
    });

    test("userTypeSelector returns admin user type", () => {
        const mockParticipantState: RootState = {
            ...rootStore.getState(),
            [userReducerName]: {
                ...initialState,
                userData: {
                    ...initialState.userData,
                    user: mockAdminUser,
                },
            },
        };
        expect(userTypeSelector(mockParticipantState)).toEqual("admin");
    });

    test("loginSelector returns the login object", () => {
        expect(loginSelector(mockState)).toEqual(mockState[userReducerName].login);
    });

    test("logoutSelector returns the logout object", () => {
        expect(logoutSelector(mockState)).toEqual(mockState[userReducerName].logout);
    });

    test("userAcceptanceSelector returns the user acceptance response", () => {
        expect(userAcceptanceSelector(mockState)).toEqual(
            mockState[userReducerName].userAcceptance
        );
    });

    test("createProfileSelector returns the current profile response", () => {
        expect(createProfileSelector(mockState)).toEqual(
            mockState[userReducerName].createProfile
        );
    });
});

describe("fetchUserData Thunk and Reducer", () => {
    describe("Reducers", () => {
        test("Pending", () => {
            expect(
                reducer(initialState, fetchUserData.pending).userData.isLoading
            ).toBe(true);
        });

        test("Fulfilled", () => {
            expect(
                reducer(initialState, fetchUserData.fulfilled(mockUser, "fulfilled"))
                    .userData
            ).toEqual({
                user: mockUser,
                isLoading: false,
                error: null,
            });
        });

        test("Rejected by rejectWithValue", () => {
            const expectedFailureResponse = { status: 999, message: "Some message" };
            const action = fetchUserData.rejected(
                {
                    message: "Rejected",
                    name: "Error",
                }, // createAsyncThunk will always have {message: "Rejected"} for rejectWithValue
                "some-id",
                undefined, // Arg passed to the thunk
                expectedFailureResponse
            );
            expect(reducer(initialState, action).userData).toEqual({
                user: null,
                isLoading: false,
                error: expectedFailureResponse,
            });
        });
    });

    test("Successfully fetch user data", async () => {
        const response = { data: mockUser };

        mockedGet.mockResolvedValue(response as AxiosResponse<User>);

        const store = mockStore(mockState);
        await store.dispatch(fetchUserData());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            expect.objectContaining({
                type: fetchUserData.fulfilled.type,
                payload: response.data,
            })
        );
    });

    describe("Failed to fetch user data", () => {
        beforeEach(() => {
            // Used by displaySnackbar
            jest.spyOn(global.Math, "random").mockReturnValue(0.45526621894095487);
        });

        afterEach(() => {
            jest.spyOn(global.Math, "random").mockRestore();
        });

        test("Failed because the user was unauthenticated", async () => {
            const error = {
                response: {
                    status: 401,
                    data: {
                        detail: "You are unauthenticated",
                    },
                },
            };
            mockedGet.mockRejectedValueOnce(error);

            const store = mockStore(mockState);
            await store.dispatch(fetchUserData());

            const actions = store.getActions();

            expect(actions).toEqual([
                expect.objectContaining({
                    type: fetchUserData.pending.type,
                }),
                push("/login"),
                expect.objectContaining({
                    type: fetchUserData.rejected.type,
                    payload: { status: 401, message: error.response.data.detail },
                }),
            ]);
        });

        test("Failed for some other reason with a response", async () => {
            const error = {
                response: {
                    status: 999,
                    data: "Something went wrong",
                },
            };
            mockedGet.mockRejectedValueOnce(error);

            const store = mockStore(mockState);
            await store.dispatch(fetchUserData());

            const actions = store.getActions();

            expect(actions).toEqual([
                expect.objectContaining({
                    type: fetchUserData.pending.type,
                }),
                displaySnackbar({
                    message: `Failed to fetch user data: Error ${error.response.status}`,
                    options: { variant: "error" },
                }),
                expect.objectContaining({
                    type: fetchUserData.rejected.type,
                    payload: { status: 999, message: error.response.data },
                }),
            ]);
        });

        test("Failed without a response", async () => {
            const error = {
                message: "Something really went wrong",
            };
            mockedGet.mockRejectedValueOnce(error);

            const store = mockStore(mockState);
            await store.dispatch(fetchUserData());

            const actions = store.getActions();

            expect(actions).toEqual([
                expect.objectContaining({
                    type: fetchUserData.pending.type,
                }),
                displaySnackbar({
                    message: `Failed to fetch user data: ${error.message}`,
                    options: { variant: "error" },
                }),
                expect.objectContaining({
                    type: fetchUserData.rejected.type,
                    payload: { status: 500, message: error.message },
                }),
            ]);
        });
    });
});

describe("logIn Thunk and Reducer", () => {
    const body = { email: "foo@bar.com", password: "foobar123" };

    describe("Reducers", () => {
        test("Pending", () => {
            expect(reducer(initialState, logIn.pending).login.isLoading).toBe(true);
        });

        test("Fulfilled", () => {
            expect(reducer(initialState, logIn.fulfilled)).toEqual(
                expect.objectContaining({
                    isAuthenticated: true,
                    login: { isLoading: false, failure: null },
                })
            );
        });

        test("Rejected by rejectWithValue", () => {
            const expectedFailureResponse = { status: 999, message: "Some message" };
            const action = logIn.rejected(
                { name: "not allowed", message: "Rejected" },
                "some-id",
                body,
                expectedFailureResponse // This becomes action.payload
            );
            expect(reducer(initialState, action)).toEqual(
                expect.objectContaining({
                    isAuthenticated: false,
                    login: { isLoading: false, failure: expectedFailureResponse },
                })
            );
        });
    });

    test("Successful login", async () => {
        const response: AxiosResponse = makeMockApiResponse({ key: "abc123" });
        mockedPost.mockResolvedValueOnce(response);

        const store = mockStore(mockState);
        await store.dispatch(logIn(body));

        const actions = store.getActions();

        expect(actions).toContainEqual(
            expect.objectContaining({
                type: logIn.fulfilled.type,
                payload: response.data,
            })
        );
        expect(actions).toContainEqual(push("/"));
    });

    describe("Failed login", () => {
        test("Invalid credentials failure", async () => {
            const error = {
                response: {
                    data: {
                        non_field_errors: [
                            "Unable to log in with provided credentials.",
                        ],
                    },
                    status: 400,
                },
            };
            const expectedFailureResponse = {
                status: 400,
                message: "Invalid credentials",
            };

            mockedPost.mockRejectedValueOnce(error);

            const store = mockStore(mockState);
            await store.dispatch(logIn(body));

            const actions = store.getActions();

            expect(actions).toContainEqual(
                expect.objectContaining({
                    type: logIn.rejected.type,
                    payload: expectedFailureResponse,
                })
            );
        });

        test("CSRF Failure", async () => {
            const error = {
                response: {
                    data: { detail: "CSRF Failed: CSRF token missing or incorrect." },
                    status: 403,
                },
            };
            const expectedFailureResponse = {
                status: 403,
                message: "Invalid CSRF Token",
            };

            mockedPost.mockRejectedValueOnce(error);

            const store = mockStore(mockState);
            await store.dispatch(logIn(body));

            const actions = store.getActions();

            expect(actions).toContainEqual(
                expect.objectContaining({
                    type: logIn.rejected.type,
                    payload: expectedFailureResponse,
                })
            );
        });

        test("Other API error", async () => {
            const error = {
                response: {
                    data: "Uh oh",
                    status: 500,
                },
            };
            const expectedFailureResponse = {
                status: 500,
                message: error.response.data,
            };

            mockedPost.mockRejectedValueOnce(error);

            const store = mockStore(mockState);
            await store.dispatch(logIn(body));

            const actions = store.getActions();

            expect(actions).toContainEqual(
                expect.objectContaining({
                    type: logIn.rejected.type,
                    payload: expectedFailureResponse,
                })
            );
        });
    });
});

describe("UserAcceptance Thunk and Reducer", () => {
    describe("Reducers", () => {
        test("Pending", () => {
            expect(
                reducer(initialState, fetchUserAcceptanceStatus.pending).userAcceptance
                    .isLoading
            ).toBe(true);
        });

        test("Fulfilled", () => {
            expect(
                reducer(
                    initialState,
                    fetchUserAcceptanceStatus.fulfilled(
                        mockUserWithReviewStatus,
                        "fulfilled"
                    )
                ).userAcceptance
            ).toEqual({
                user: mockUserWithReviewStatus,
                isLoading: false,
                error: null,
            });
        });

        test("Rejected by rejectWithValue", () => {
            const expectedFailureResponse = { status: 999, message: "Some message" };
            const action = fetchUserAcceptanceStatus.rejected(
                { message: "Rejected", name: "Error" },
                "some-id",
                undefined,
                expectedFailureResponse
            );
            expect(reducer(initialState, action)).toEqual(
                expect.objectContaining({
                    userAcceptance: {
                        user: null,
                        isLoading: false,
                        error: expectedFailureResponse,
                    },
                })
            );
        });
    });

    test("Successfully fetched user acceptance", async () => {
        const response: AxiosResponse<UserWithReviewStatus> = makeMockApiResponse(
            mockUserWithReviewStatus
        );
        mockedGet.mockResolvedValueOnce(response);

        const store = mockStore(mockState);
        await store.dispatch(fetchUserAcceptanceStatus());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            expect.objectContaining({
                type: fetchUserAcceptanceStatus.fulfilled.type,
                payload: response.data,
            })
        );
    });

    test("Failed to fetch user acceptance", async () => {
        const error = {
            response: { status: 999, data: "Something went wrong" },
        };
        mockedGet.mockRejectedValueOnce(error);

        const store = mockStore(mockState);
        await store.dispatch(fetchUserAcceptanceStatus());

        const actions = store.getActions();

        expect(actions).toEqual([
            expect.objectContaining({
                type: fetchUserAcceptanceStatus.pending.type,
            }),
            displaySnackbar({
                message: `Failed to fetch user acceptance data: Error ${error.response.status}`,
                options: { variant: "error" },
            }),
            expect.objectContaining({
                type: fetchUserAcceptanceStatus.rejected.type,
                payload: {
                    status: error.response.status,
                    message: error.response.data,
                },
            }),
        ]);
    });
});

describe("createProfile Thunk and Reducer", () => {
    describe("Reducers", () => {
        test("Pending", () => {
            expect(
                reducer(initialState, createProfile.pending).createProfile.isLoading
            ).toBe(true);
        });

        test("Fulfilled", () => {
            expect(
                reducer(
                    initialState,
                    createProfile.fulfilled(
                        mockProfile,
                        "fulfilled",
                        mockProfileRequestBody
                    )
                ).createProfile
            ).toEqual({
                profile: mockProfile,
                isLoading: false,
                error: null,
            });
        });

        test("Rejected by rejectWithValue", () => {
            const expectedFailureResponse = { status: 999, message: "Some message" };
            const action = createProfile.rejected(
                { message: "Rejected", name: "Error" },
                "some-id",
                mockProfileRequestBody,
                expectedFailureResponse
            );
            expect(reducer(initialState, action)).toEqual(
                expect.objectContaining({
                    createProfile: {
                        profile: null,
                        isLoading: false,
                        error: expectedFailureResponse,
                    },
                })
            );
        });
    });

    test("Successfully created profile", async () => {
        const response: AxiosResponse<Profile> = makeMockApiResponse(mockProfile);
        mockedPost.mockResolvedValueOnce(response);

        const store = mockStore(mockState);
        await store.dispatch(createProfile(mockProfileRequestBody));

        const actions = store.getActions();

        expect(actions).toContainEqual(
            expect.objectContaining({
                type: createProfile.fulfilled.type,
                payload: response.data,
            })
        );
    });

    test("Failed to fetch user acceptance", async () => {
        const error = {
            response: { status: 999, data: "Something went wrong" },
        };
        mockedPost.mockRejectedValueOnce(error);

        const store = mockStore(mockState);
        await store.dispatch(createProfile(mockProfileRequestBody));

        const actions = store.getActions();

        expect(actions).toEqual([
            expect.objectContaining({
                type: createProfile.pending.type,
            }),
            displaySnackbar({
                message: `An error has occurred! We couldn't grant you permission to access Hardware Signout Site: Error ${error.response.status}`,
                options: { variant: "error" },
            }),
            expect.objectContaining({
                type: createProfile.rejected.type,
                payload: {
                    status: error.response.status,
                    message: error.response.data,
                },
            }),
        ]);
    });
});
