import React from "react";
import { render, fireEvent, waitFor, getByLabelText } from "@testing-library/react";
import { DeepPartial } from "redux";

import InventorySearch from "components/inventory/InventorySearch/InventorySearch";
import { get } from "api/api";
import { withStore } from "testing/utils";
import { HardwareFilters } from "api/types";
import {
    hardwareReducerName,
    initialState,
    HardwareState,
} from "slices/hardware/hardwareSlice";
import { makeStore, RootState } from "slices/store";

jest.mock("api/api");

const makeState = (overrides: Partial<HardwareState>): DeepPartial<RootState> => ({
    [hardwareReducerName]: {
        ...initialState,
        ...overrides,
    },
});

describe("<InventorySearch />", () => {
    it("Submits search query", async () => {
        const { getByLabelText } = render(withStore(<InventorySearch />));

        const input = getByLabelText(/search items/i);

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters: HardwareFilters = {
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(expect.anything(), expectedFilters);
        });
    });

    it("Submits search query when clicking search button", async () => {
        const { getByLabelText, getByTestId } = render(withStore(<InventorySearch />));

        const input = getByLabelText(/search items/i);
        const searchButton = getByTestId("search-button");

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.click(searchButton);

        const expectedFilters: HardwareFilters = {
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(expect.anything(), expectedFilters);
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
        const store = makeStore(preloadedState);

        const { getByLabelText } = render(withStore(<InventorySearch />, store));

        const input = getByLabelText(/search items/i);
        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters = {
            ...initialFilters,
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(expect.anything(), expectedFilters);
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
        const store = makeStore(preloadedState);

        const { getByTestId } = render(withStore(<InventorySearch />, store));

        const clearButton = getByTestId("clear-button");
        fireEvent.click(clearButton);

        const { search, ...expectedFilters } = initialFilters;

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(expect.anything(), expectedFilters);
        });
    });
});
