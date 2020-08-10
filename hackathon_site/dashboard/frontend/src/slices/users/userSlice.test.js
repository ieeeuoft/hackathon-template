import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { push } from "connected-react-router";

import { post, get } from "api/api";
import { mockUser } from "testing/mockData";
import { displaySnackbar } from "slices/ui/uiSlice";
import {
    userSliceSelector,
    userDataSelector,
    userSelector,
    loginSelector,
    reducer,
    userReducerName,
    initialState,
    logIn,
    fetchUserData,
} from "./userSlice";

jest.mock("api/api");

const mockStore = configureStore([thunk]);

const mockState = {
    [userReducerName]: initialState,
};

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

    test("loginSelector returns the login object", () => {
        expect(loginSelector(mockState)).toEqual(mockState[userReducerName].login);
    });
});

describe("fetchUserData Thunk and Reducer", () => {
    let store;

    beforeEach(() => {
        store = mockStore(mockState);
    });

    describe("Reducers", () => {
        test("Pending", () => {
            expect(
                reducer(initialState, fetchUserData.pending()).userData.isLoading
            ).toBe(true);
        });

        test("Fulfilled", () => {
            expect(
                reducer(initialState, fetchUserData.fulfilled(mockUser)).userData
            ).toEqual({
                user: mockUser,
                isLoading: false,
                error: null,
            });
        });

        test("Rejected by rejectWithValue", () => {
            const expectedFailureResponse = { status: 999, message: "Some message" };
            const action = fetchUserData.rejected(
                "Rejected", // createAsyncThunk will always have {message: "Rejected"} for rejectWithValue
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
        get.mockImplementationOnce(() => Promise.resolve(response));

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
        beforeAll(() => {
            // Used by displaySnackbar
            jest.spyOn(global.Math, "random").mockReturnValue(0.45526621894095487);
        });

        afterAll(() => {
            global.Math.random.mockRestore();
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
            get.mockImplementationOnce(() => Promise.reject(error));

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
                response: { status: 999, data: "Something went wrong" },
            };
            get.mockImplementationOnce(() => Promise.reject(error));

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
            get.mockImplementationOnce(() => Promise.reject(error));

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
                    payload: { status: null, message: error.message },
                }),
            ]);
        });
    });
});

describe("logIn Thunk and Reducer", () => {
    const body = { email: "foo@bar.com", password: "foobar123" };
    let store;

    beforeEach(() => {
        store = mockStore(mockState);
    });

    describe("Reducers", () => {
        test("Pending", () => {
            expect(reducer(initialState, logIn.pending()).login.isLoading).toBe(true);
        });

        test("Fulfilled", () => {
            expect(reducer(initialState, logIn.fulfilled())).toEqual(
                expect.objectContaining({
                    isAuthenticated: true,
                    login: { isLoading: false, failure: null },
                })
            );
        });

        test("Rejected by rejectWithValue", () => {
            const expectedFailureResponse = { status: 999, message: "Some message" };
            const action = logIn.rejected(
                "Rejected",
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
        const response = { data: { key: "abc123" } };
        post.mockImplementationOnce(() => Promise.resolve(response));

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

            post.mockImplementationOnce(() => Promise.reject(error));

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

            post.mockImplementationOnce(() => Promise.reject(error));

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

            post.mockImplementationOnce(() => Promise.reject(error));

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
