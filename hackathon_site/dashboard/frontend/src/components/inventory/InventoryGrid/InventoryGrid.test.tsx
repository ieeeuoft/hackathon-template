import React from "react";

import { render, waitFor, promiseResolveWithDelay } from "testing/utils";

import InventoryGrid from "components/inventory/InventoryGrid/InventoryGrid";
import { get, AxiosResponse } from "api/api";
import { mockHardware } from "testing/mockData";
import { APIListResponse, Hardware } from "api/types";
import { makeStore } from "slices/store";
import { getHardwareWithFilters } from "slices/hardware/hardwareSlice";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("<InventoryGrid />", () => {
    it("Displays a message when no items found", () => {
        const { getByText } = render(<InventoryGrid />);

        expect(getByText(/no items found/i)).toBeInTheDocument();
    });

    it("Renders all hardware from the store", async () => {
        // To populate the store, dispatch a thunk while mocking the API response
        const apiResponse: APIListResponse<Hardware> = {
            count: mockHardware.length,
            results: mockHardware,
            next: null,
            previous: null,
        };

        mockedGet.mockResolvedValue({ data: apiResponse } as AxiosResponse);

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
        const apiResponse: APIListResponse<Hardware> = {
            count: mockHardware.length,
            results: mockHardware,
            next: null,
            previous: null,
        };

        mockedGet.mockReturnValue(
            promiseResolveWithDelay({ data: apiResponse } as AxiosResponse, 500)
        );

        const store = makeStore();
        store.dispatch(getHardwareWithFilters());

        const { getByText, queryByTestId } = render(<InventoryGrid />, { store });

        await waitFor(() => {
            expect(queryByTestId("linear-progress")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
            expect(queryByTestId("linear-progress")).not.toBeInTheDocument();
        });
    });
});
