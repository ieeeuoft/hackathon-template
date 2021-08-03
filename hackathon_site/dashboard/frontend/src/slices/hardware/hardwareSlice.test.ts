import store, { RootState } from "slices/store";
import {
    hardwareSliceSelector,
    hardwareReducerName,
    initialState,
} from "./hardwareSlice";

const mockState: RootState = {
    ...store.getState(),
    [hardwareReducerName]: initialState,
};

describe("Selectors", () => {
    test("hardwareSliceSelector returns the hardware store", () => {
        expect(hardwareSliceSelector(mockState)).toEqual(
            mockState[hardwareReducerName]
        );
    });
});
