import React from "react";
import { DeepPartial } from "redux";

import { render, fireEvent, waitFor } from "testing/utils";

import InventorySearch from "components/inventory/InventorySearch/InventorySearch";
import { get } from "api/api";
import { HardwareFilters } from "api/types";
import {
    hardwareReducerName,
    initialState,
    HardwareState,
} from "slices/hardware/hardwareSlice";
import { RootState } from "slices/store";

jest.mock("api/api");

const makeState = (overrides: Partial<HardwareState>): DeepPartial<RootState> => ({
    [hardwareReducerName]: {
        ...initialState,
        ...overrides,
    },
});

const hardwareUri = "/api/hardware/hardware/";

describe("<InventorySearch />", () => {
    it("Submits search query", async () => {
        const { getByLabelText } = render(<InventorySearch />);

        const input = getByLabelText(/search items/i);

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters: HardwareFilters = {
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(hardwareUri, expectedFilters);
        });
    });

    it("Submits search query when clicking search button", async () => {
        const { getByLabelText, getByTestId } = render(<InventorySearch />);

        const input = getByLabelText(/search items/i);
        const searchButton = getByTestId("search-button");

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.click(searchButton);

        const expectedFilters: HardwareFilters = {
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(hardwareUri, expectedFilters);
        });
    });

    it("Changes only the search filter when submitted", async () => {
        const initialFilters: HardwareFilters = {
            in_stock: true,
            ordering: "-name",
            category_ids: [1, 2],
            search: "abc123",
        };

        const preloadedState = makeState({ filters: initialFilters });

        const { getByLabelText } = render(<InventorySearch />, { preloadedState });

        const input = getByLabelText(/search items/i);
        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters = {
            ...initialFilters,
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(hardwareUri, expectedFilters);
        });
    });

    it("Removes the search filter and submits when cleared", async () => {
        const initialFilters: HardwareFilters = {
            in_stock: true,
            ordering: "-name",
            category_ids: [1, 2],
            search: "abc123",
        };

        const preloadedState = makeState({ filters: initialFilters });

        const { getByTestId } = render(<InventorySearch />, { preloadedState });

        const clearButton = getByTestId("clear-button");
        fireEvent.click(clearButton);

        const { search, ...expectedFilters } = initialFilters;

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(hardwareUri, expectedFilters);
        });
    });
});
