import configureStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";

import store, { makeStore, RootState } from "slices/store";
import {
    hardwareSliceSelector,
    hardwareReducerName,
    initialState,
    getHardwareWithFilters,
} from "./hardwareSlice";
import { get } from "api/api";
import { AnyAction } from "redux";
import { displaySnackbar } from "slices/ui/uiSlice";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

/**
 * The unit tests for this slice are intentionally light. Functionality
 * is primarily tested as integration tests in the Inventory components,
 * considering the actual details of the slice as "implementation details"
 * that don't themselves need to be directly tested.
 *
 * Some aspects of the slice that are difficult to test elsewhere are
 * still tested here.
 */

const mockState: RootState = {
    ...store.getState(),
    [hardwareReducerName]: initialState,
};

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const mockStore = configureStore<RootState, DispatchExts>([thunk]);

describe("Selectors", () => {
    test("hardwareSliceSelector returns the hardware store", () => {
        expect(hardwareSliceSelector(mockState)).toEqual(
            mockState[hardwareReducerName]
        );
    });
});

describe("getHardwareWithFilters thunk", () => {
    it("Dispatches a snackbar on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Something went wrong",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = mockStore(mockState);
        await store.dispatch(getHardwareWithFilters());

        const actions = store.getActions();

        expect(actions).toContainEqual(
            displaySnackbar({
                message: "Failed to fetch hardware data: Error 500",
                options: { variant: "error" },
            })
        );
    });

    it("Updates the store on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Something went wrong",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = makeStore();
        await store.dispatch(getHardwareWithFilters());

        expect(store.getState()[hardwareReducerName]).toHaveProperty(
            "error",
            failureResponse.response.message
        );
    });
});

describe('getHardwareNextPage thunk', () =>{
     it("Updates the store on API success", async () => {
        const response = makeMockApiListResponse(mockHardware);
        mockedGet.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(getHardwareWithFilters());

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/hardware/hardware/", {});
            expect(hardwareSelectors.selectIds(store.getState())).toEqual(
                mockHardware.map(({ id }) => id)
            );
        });
    });
});
