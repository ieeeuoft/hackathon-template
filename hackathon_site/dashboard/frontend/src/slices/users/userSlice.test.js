import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { push } from "connected-react-router";

import { post } from "api/api.js";

import {
    userSelector,
    userDataSelector,
    loginSelector,
    reducer,
    userReducerName,
    fetchUserById,
    initialState,
    logIn,
} from "./userSlice";

const mockStore = configureStore([thunk]);
jest.mock("api/api");

const mockState = {
    [userReducerName]: {
        ...initialState,
    },
};

describe("Selectors", () => {
    it("userSelector returns the user store", () => {
        expect(userSelector(mockState)).toEqual(mockState[userReducerName]);
    });

    it("userDataSelector pulls out the userData object", () => {
        expect(userDataSelector(mockState)).toEqual(
            mockState[userReducerName].userData
        );
    });

    it("loginSelector pulls out the login object", () => {
        expect(loginSelector(mockState)).toEqual(mockState[userReducerName].login);
    });
});

describe("userData Reducers", () => {
    it("Sets loading state on pending action", () => {
        expect(reducer(initialState, fetchUserById.pending()).userData).toEqual({
            ...initialState.userData,
            isLoading: true,
        });
    });

    it("Sets data on fulfilled action", () => {
        const expectedData = {
            name: "Foo Bar",
        };
        expect(
            reducer(initialState, fetchUserById.fulfilled(expectedData)).userData
        ).toEqual({
            ...initialState.userData,
            isLoading: false,
            data: expectedData,
        });
    });

    it("Sets error on rejected action", async () => {
        // Per the docs, if the promise rejects without calling rejectWithValue,
        // the serialized error will be in action.error: https://redux-toolkit.js.org/api/createAsyncThunk

        // The action creator actually expects a serialized error object with more fields than this
        // so IDEs may throw a type warning, but passing in an Object works the same
        const error = { message: "Something went wrong" };
        expect(reducer(initialState, fetchUserById.rejected(error)).userData).toEqual({
            ...initialState.userData,
            error: error,
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

        test("Rejected with known issue", () => {
            const expectedFailureResponse = { status: 999, message: "Some message" };
            const action = logIn.rejected(
                "Rejected", // createAsyncThunk will always have {message: "Rejected"} for rejectWithValue
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
        post.mockImplementation(() => Promise.resolve(response));

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

            post.mockImplementation(() => Promise.reject(error));

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

            post.mockImplementation(() => Promise.reject(error));

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

            post.mockImplementation(() => Promise.reject(error));

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
