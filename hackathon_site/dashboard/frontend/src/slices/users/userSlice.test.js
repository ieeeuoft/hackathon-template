import axios from "axios";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

import {
    userSelector,
    userDataSelector,
    userReducerName,
    fetchUserById,
} from "./userSlice";

jest.mock("axios");

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

describe("fetchByUserId thunk", () => {
    let store;

    beforeEach(() => {
        store = mockStore(mockState);
    });

    // it("Sets loading status while pending", () => {
    //     // axios.get.mockImplementationOnce(() => new Promise(() => {}));
    //     // console.log("here");
    //     const type = fetchUserById.pending.type;
    //     console.log(type);
    //     store.dispatch({ type: type });
    //     const actions = store.getActions();
    //     console.log(actions);
    // });
    // it("Sets data when request succeeds", async (done) => {
    //     const data = { name: "Foo Bar" };
    //     axios.get.mockImplementationOnce(() => {
    //         Promise.resolve(data);
    //     });
    //     await store.dispatch(fetchUserById(1));
    //     console.log(store.getActions());
    // });
});
