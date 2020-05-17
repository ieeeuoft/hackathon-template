import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

import {
    userSelector,
    userDataSelector,
    reducer,
    userReducerName,
    fetchUserById,
    initialState,
} from "./userSlice";

const mockStore = configureStore([thunk]);

const mockState = {
    [userReducerName]: {
        userData: {
            isLoading: false,
            data: null,
            error: null,
        },
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
});

describe("userData Reducers", () => {
    let store;

    beforeEach(() => {
        store = mockStore(mockState);
    });

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
