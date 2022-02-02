import React from "react";

import {
    render,
    waitFor,
    promiseResolveWithDelay,
    makeMockApiListResponse,
} from "testing/utils";

import InventoryGrid from "components/inventory/InventoryGrid/InventoryGrid";
import { get } from "api/api";
import { mockHardware } from "testing/mockData";
import { makeStore } from "slices/store";
import { getHardwareWithFilters } from "slices/hardware/hardwareSlice";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("<InventoryGrid />", () => {
    it("Renders all hardware from the store", async () => {
        // To populate the store, dispatch a thunk while mocking the API response
        const apiResponse = makeMockApiListResponse(mockHardware);

        mockedGet.mockResolvedValue(apiResponse);

        const store = makeStore();
        store.dispatch(getHardwareWithFilters());

        const { getByText } = render(<InventoryGrid />, { store });

        await waitFor(() => {
            mockHardware.forEach((hardware) =>
                expect(getByText(hardware.name)).toBeInTheDocument()
            );
        });
    });

    it("Displays a linear progress when loading", async () => {
        const apiResponse = makeMockApiListResponse(mockHardware);

        mockedGet.mockReturnValue(promiseResolveWithDelay(apiResponse, 500));

        const store = makeStore();
        store.dispatch(getHardwareWithFilters());

        const { getByText, queryByTestId } = render(<InventoryGrid />, { store });

        await waitFor(() => {
            expect(queryByTestId("linear-progress")).toBeInTheDocument();
        });

        // After results have loaded, progress bar should disappear
        await waitFor(() => {
            expect(queryByTestId("linear-progress")).not.toBeInTheDocument();
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
        });
    });
});
