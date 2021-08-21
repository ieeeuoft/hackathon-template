import React from "react";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import { render, fireEvent, waitFor, act } from "@testing-library/react";

import { get } from "api/api";
import { inventoryCategories } from "testing/mockData";
import { withStore } from "testing/utils";
import { makeStore, RootState } from "slices/store";
import { hardwareReducerName, initialState } from "slices/hardware/hardwareSlice";
import { HardwareFilters } from "api/types";
import { DeepPartial } from "redux";

jest.mock("api/api");

describe("<InventoryFilter />", () => {
    /* Inventory filter tests
     *
     * Rather than testing just the unconnected inventory filter and using
     * mocks for redux actions, these tests are closer to integration tests.
     * They directly test the connected filter, and assert all the way on
     * the level of the (mocked) API requests.
     */

    it("Submits selected filters", async () => {
        const { getByText } = render(withStore(<InventoryFilter />));

        const orderByNameButton = getByText("Z-A");
        const inStockCheckbox = getByText("In stock");

        // TODO: Once categories are connected to the store,
        //  some mocking will be required to populate this data
        const mcuCheckbox = getByText("MCU_limit_3");
        const FPGACheckbox = getByText("FPGA");

        const applyButton = getByText("Apply");

        fireEvent.click(orderByNameButton);
        fireEvent.click(inStockCheckbox);
        fireEvent.click(mcuCheckbox);
        fireEvent.click(FPGACheckbox);
        fireEvent.click(applyButton);

        const expectedFilters: HardwareFilters = {
            ordering: "-name",
            in_stock: true,
            category_ids: [2, 3],
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(expect.anything(), expectedFilters);
        });
    });

    it("Clears filters when toggled", async () => {
        const { getByText } = render(withStore(<InventoryFilter />));

        const orderByNameButton = getByText("Z-A");
        const inStockCheckbox = getByText("In stock");
        const FPGACheckbox = getByText("FPGA");
        const applyButton = getByText("Apply");

        fireEvent.click(orderByNameButton);
        fireEvent.click(inStockCheckbox);
        fireEvent.click(FPGACheckbox);

        fireEvent.click(inStockCheckbox);
        fireEvent.click(FPGACheckbox);
        fireEvent.click(applyButton);

        const expectedFilters: HardwareFilters = {
            ordering: "-name",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(expect.anything(), expectedFilters);
        });
    });

    it("Disables the clear and apply buttons when loading", async () => {
        const preloadedState: DeepPartial<RootState> = {
            [hardwareReducerName]: {
                ...initialState,
                isLoading: true,
            },
        };
        const store = makeStore(preloadedState);

        const { getByText } = render(withStore(<InventoryFilter />, store));

        const applyButton = getByText("Apply");
        const clearButton = getByText(/clear all/i);

        expect(applyButton.closest("button")).toBeDisabled();
        expect(clearButton.closest("button")).toBeDisabled();
    });

    it("Renders options for each category", () => {
        const { getByText } = render(withStore(<InventoryFilter />));

        for (let c of inventoryCategories) {
            expect(getByText(c.name)).toBeInTheDocument();
        }
    });
});
